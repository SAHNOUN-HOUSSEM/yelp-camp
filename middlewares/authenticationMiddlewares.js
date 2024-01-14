const Campground = require("../models/campground")
const Notification = require("../models/notification")
const Review = require("../models/review")
const User = require("../models/user")
const asyncHandler = require("../utilities/asyncHandler")

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "you must be authenticated to access this url")
    res.redirect("/login?returnTo=" + req.originalUrl)
}

const ensureGuest = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "you cannot access this url")
    res.redirect("/")
}

const setReturnTo = (req, res, next) => {
    res.locals.returnTo = req.session.returnTo || "/campgrounds"
    next()
}

const isCampgroundOwner = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const c = await Campground.findById(id)
    if (!c) {
        req.flash("error", "campground not found")
        return res.redirect("/campgrounds")
    }
    if (!req.user.equals(c.owner) && !req.user.isAdmin) {
        req.flash("error", "you don't have permission")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
})

const isReviewOwner = asyncHandler(async (req, res, next) => {
    const { campgroundId, reviewId } = req.params;
    const c = await Campground.findById(campgroundId)
    if (!c) {
        req.flash("error", "campground not found")
        return res.redirect("/campgrounds")
    }
    const r = await Review.findById(reviewId)
    if (!r) {
        req.flash("error", "review not found")
        return res.redirect()
    }
    if (!req.user.equals(r.owner) && !req.user.isAdmin) {
        req.flash("error", "you don't have permission")
        return res.redirect(`/campgrounds/${campgroundId}`)
    }
    next()
})

const isAccountOwner = async (req, res, next) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        req.flash("error", "there's no user with such id")
        return res.redirect("/campgrounds")
    }
    if (id != req.user._id.toString()) {
        req.flash("error", "you cannot access this url")
        return res.redirect(`/users/${id}`)
    }
    next()
}

const isNotificationRecipient = async (req, res , next) => {
    const { id } = req.params
    const notification = await Notification.findById(id)
    if(req.user.equals(notification.recipient)){
        return next()
    }
    req.flash("error" , "you cannot access this url")
    res.redirect("/campgrounds")
}

module.exports = {
    ensureAuthenticated,
    setReturnTo,
    isCampgroundOwner,
    isReviewOwner,
    isAccountOwner,
    ensureGuest,
    isNotificationRecipient
}
