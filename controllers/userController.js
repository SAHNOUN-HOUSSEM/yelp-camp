const cloudinary = require("../cloudinary/config")
const Address = require("../models/address")
const Campground = require("../models/campground")
const User = require("../models/user")
const createImageUrl = require("../utilities/createImageUrl")

module.exports.show = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
        .populate('address')
    if (!user) {
        req.flash("error", "there's no user with such id")
        return res.redirect("/campgrounds")
    }
    const campgrounds = await Campground.find({ owner: id })
    res.render("users/profile", { user, campgrounds })
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
        .populate('address')
    res.render("users/edit", { user })
}

module.exports.update = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (req.body.user.username !== user.username && await User.findOne({ username: req.body.user.username })) {
        req.flash("error", "username is already taken")
        return res.redirect(`/users/${id}/edit`)
    }
    let avatar
    if (req.file) {
        cloudinary.uploader.destroy(user.avatar.filename)
        avatar = {
            url: createImageUrl(req.file.filename),
            filename: req.file.filename
        }
    }
    await Address.updateOne({ _id: user.address }, req.body.user.address)
    delete req.body.user.address
    await user.updateOne({ ...req.body.user, avatar })
    res.redirect(`/users/${id}`)
}