const Campground = require("../models/campground")
const Review = require("../models/review")

module.exports.create = async (req, res) => {
    const campground = await Campground.findById(req.params.campgroundId)
    if (!campground) {
        req.flash("error", "campground not found")
        res.redirect("/campgrounds")
    }
    const review = new Review(req.body.review)
    review.owner = req.user
    const reviewsCount = campground.reviews.length
    campground.rating = (campground.rating * reviewsCount + review.rating) / (reviewsCount + 1)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash("success", "review added successfully")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async (req, res) => {
    const { campgroundId, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(campgroundId, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "review deleted successfully")
    res.redirect(`/campgrounds/${campgroundId}`)
}

module.exports.index = async (req, res) => {
    const { limit = 5 } = req.query
    const campground = await Campground.findById(req.params.campgroundId)
    const reviewsCount = await Review.count({ _id: { $in: campground.reviews } })
    const totalPages = Math.ceil(reviewsCount / limit)
    const reviews = await Review.find({ _id: { $in: campground.reviews } })
        .limit(5)
        .populate("owner")
    res.render("campgrounds/reviews", { campground, reviews, totalPages })
}

module.exports.paginationAPI = async (req, res) => {
    const { page, limit = 5 } = req.query
    const reviews = await Review.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("owner")
    res.json(reviews)
}