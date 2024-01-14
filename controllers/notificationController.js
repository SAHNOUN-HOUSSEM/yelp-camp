const Notification = require("../models/notification")
const User = require("../models/user")

module.exports.follow = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        req.flash("error", "unkown user")
        res.redirect("/campgrounds")
    }
    if (user.followers.find(follower => req.user.equals(follower))) {
        req.flash("error", 'you already follow this user')
        return res.redirect(`/users/${id}`)
    }
    user.followers.push(req.user)
    await user.save()
    req.flash("success", `followed ${user.username} successfully`)
    res.redirect(`/users/${id}`)
}

module.exports.index = async (req, res) => {
    const allNotifications = await Notification.find({ recipient: req.user })
        .populate('sender', "username")
        .populate("campground", 'title')
        .sort({ "createdAt": "desc" })
    res.render("users/notifications", { allNotifications })
}

module.exports.handleNotification = async (req, res) => {
    const { id } = req.params
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true })
    if (!notification) {
        req.flash("error", "there's no notification with such id")
        return res.redirect("/campgrounds")
    }
    res.redirect(`/campgrounds/${notification.campground}`)
}
