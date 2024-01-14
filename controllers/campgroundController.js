require("dotenv").config()
const Campground = require("../models/campground")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const createImageUrl = require("../utilities/createImageUrl")
const cloudinary = require("../cloudinary/config")
const Notification = require("../models/notification")
const escapeRegex = require("../utilities/escapeRegex")

const geocoding = mbxGeocoding({ accessToken: process.env.mapbox_access_token })

// module.exports.index = async (req, res) => {
//     let campgrounds, page, limit, totalCampgrounds, totalPages, startPage, endPage
//     let sortBy = {}
//     let pipeline = []
//     const search = req.query.search || ""
//     //...?sort=field,1/-1
//     let sort = req.query.sort || null
//     if (sort) {
//         sort = sort.split(",")
//         //sort=[field , 1/-1]
//         //sort=[field]
//         if (sort[0] === 'title') {
//             sort[0] = "lowerTitle"
//         }
//         if (!sort[1]) {
//             sort[1] = -1
//         }
//         //sort=[field , 1/-1]
//         sortBy[sort[0]] = parseInt(sort[1])
//         //sort={field : 1/-1}
//     }
//     page = parseInt(req.query.page) || 1
//     limit = parseInt(req.query.limit) || 5
//     regex = new RegExp(escapeRegex(search), 'gi');
//     totalCampgrounds = await Campground.count({ title: regex })
//     totalPages = Math.ceil(totalCampgrounds / limit)
//     const aggregate = Campground.aggregate()
//         .project({
//             lowerTitle: { $toLower: '$title' },
//             price: 1,
//             title: 1,
//             description: 1,
//             location: 1,
//             images: 1,
//             owner: 1,
//             rating: 1
//         })
//     if (sort) {
//         pipeline.push(
//             {
//                 $sort: sortBy
//             }
//         )
//     }
//     pipeline.push(
//         {
//             $limit: limit
//         }
//     )
//     pipeline.push(
//         {
//             $skip: (page - 1) * limit
//         }
//     )
//     aggregate.append(pipeline)
//     campgrounds = await aggregate.exec()
//     await Campground.populate(campgrounds, { path: "owner", select: 'username' })
//     if (campgrounds.length === 0) {
//         req.flash("error", "campgrounds not found")
//     }
//     startPage = page > 10 ? page - 10 : 1
//     endPage = page + 10 > totalPages ? totalPages : page + 10
//     res.render("campgrounds/index", {
//         campgrounds,
//         currentPage: page,
//         totalPages,
//         limit,
//         startPage,
//         endPage,
//         search
//     })
// }

module.exports.index = async (req, res) => {
    console.log(req.query);
    let campgrounds, page, limit, totalCampgrounds, totalPages, startPage, endPage
    let sortBy = {}
    const search = req.query.search || ""
    //...?sort=field&sortDir=1/-1
    let sort = req.query.sort || null
    let sortDir = null
    if (sort && sort!=="null") {
        sortDir = req.query.sortDir || -1
        sortBy[sort] = parseInt(sortDir)
        //sortBy={field : 1/-1}
    }
    page = parseInt(req.query.page) || 1
    limit = parseInt(req.query.limit) || 5
    regex = new RegExp(escapeRegex(search), 'gi');
    totalCampgrounds = await Campground.count({ title: regex })
    totalPages = Math.ceil(totalCampgrounds / limit)
    campgrounds = await Campground.find({ title: regex })
        .sort(sortBy)
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("owner", 'username')
    campgrounds.length ? res.locals.noMatch = null : res.locals.noMatch = "campgrounds not found"
    startPage = page > 10 ? page - 10 : 1
    endPage = page + 10 > totalPages ? totalPages : page + 10
    res.render("campgrounds/index", {
        campgrounds,
        currentPage: page,
        totalPages,
        limit,
        startPage,
        endPage,
        search,
        sort:req.query.sort,
        sortDir
    })
}

module.exports.newForm = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.create = async (req, res) => {
    const data = await geocoding.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.capitalizeTitle()
    campground.point = data.body.features[0].geometry
    campground.owner = req.user
    campground.images = req.files.map(file => (
        {
            filename: file.filename,
            url: createImageUrl(file.filename)
        }
    ))
    await campground.save()
    const { followers } = req.user
    followers.forEach(follower => {
        const notification = new Notification()
        notification.sender = req.user
        notification.recipient = follower
        notification.campground = campground
        notification.save()
    })
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.show = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: "owner"
        })
    if (!campground) {
        req.flash("error", "campground not found")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", { campground })
}

module.exports.update = async (req, res) => {
    const { id } = req.params
    const result = await Campground.updateOne({ _id: id }, req.body.campground)
    req.flash("success", "campground updated successfully")
    res.redirect(`/campgrounds/${id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id)
    req.flash("success", "campground deleted successfully")
    res.redirect("/campgrounds")
}

module.exports.editImages = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/images", { campground })
}

module.exports.updateImages = async (req, res) => {
    const { id } = req.params
    const { deleteImages } = req.body
    if (deleteImages) {
        for (let img of deleteImages) {
            cloudinary.uploader.destroy(img)
        }
    }
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { images: { filename: { $in: deleteImages } } } }, { new: true })
    const images = req.files.map(file => (
        {
            filename: file.filename,
            url: file.path
        }
    ))
    campground.images.push(...images)
    await campground.save()
    res.redirect(`/campgrounds/${id}`)
}

module.exports.campgroundsMap = async (req, res) => {
    const campgrounds = await Campground.find().populate("owner", "username")
    if (campgrounds.length === 0) {
        req.flash("error", "campgrounds not found")
        return res.redirect("/")
    }
    res.render("campgrounds/map", { campgrounds })
}