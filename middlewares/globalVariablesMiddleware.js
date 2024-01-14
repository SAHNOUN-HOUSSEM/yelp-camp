const Notification = require("../models/notification")
const asyncHandler = require("../utilities/asyncHandler")

module.exports.flashMessagesMiddleware = (req, res, next) => {
    res.locals.successMessages = req.flash("success")
    res.locals.errorMessages = req.flash("error")
    next()
}

module.exports.templateVariables= asyncHandler(async (req, res, next) => {
    const user = req.user || null
    res.locals.currentUser = user
    if (user) {
        const notifications = await Notification.find({ recipient: user._id, isRead: false })
            .populate('sender', "username")
            .populate("campground", 'title')
        res.locals.notifications = notifications
    }
    next()
})