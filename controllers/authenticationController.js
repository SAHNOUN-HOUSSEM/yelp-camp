const Address = require("../models/address")
const User = require("../models/user")
const createImageUrl = require("../utilities/createImageUrl")
const crypto = require('node:crypto');
const transporter = require("../nodemailer/transporter")
require("dotenv").config()

module.exports.registerForm = (req, res) => {
    res.render("users/register")
}

module.exports.register = async (req, res, next) => {
    if(await User.findOne({username:req.body.user.username})){
        req.flash("error", "A user with the given username is already registered" )
        return res.redirect("/register")
    }
    if(await User.findOne({email:req.body.user.email})){
        req.flash("error", "A user with the given email is already registered" )
        return res.redirect("/register")
    }
    const isAdmin = req.body.admincode == process.env.admin_code
    let avatar = {
        filename: null,
        url: "https://res.cloudinary.com/dwxnwtaly/image/upload/f_auto,q_auto/v1/YelpCamp/viv9gq3smmf38d0vktog",
    }
    if (req.file) {
        avatar = {
            filename: req.file.filename,
            url: createImageUrl(req.file.filename)
        }
    }
    const address = new Address(req.body.user.address)
    const user = await User.register(
        new User({
            email: req.body.user.email,
            username: req.body.user.username,
            firstname: req.body.user.firstname,
            lastname: req.body.user.lastname,
            phone: req.body.user.phone,
            avatar,
            address,
            isAdmin
        }),
        req.body.user.password
    )
    await address.save();
    req.logIn(user, (err) => {
        if (err) {
            throw err
        }
        req.flash("success", "user registred successfully")
        res.redirect("/campgrounds")
    })
}

module.exports.loginForm = (req, res) => {
    const { returnTo } = req.query
    req.session.returnTo = returnTo
    res.render("users/login")
}

module.exports.login = (req, res) => {
    const { returnTo } = res.locals
    req.flash("success", "welcome back!!")
    res.redirect(returnTo)
}

module.exports.logout = async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success", "user logged out successfully")
        res.redirect("/")
    })
}

module.exports.changePasswordForm = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        req.flash("error", "unkown user")
        return res.redirect("/")
    }
    res.render("users/changePassword", { user })
}

module.exports.changePassword = async (req, res) => {
    const { id } = req.params
    const { previousPassword, password, confirm } = req.body
    const user = await User.findById(id)
    if (password !== confirm) {
        req.flash("error", "password and password confirmation do not match")
        return res.redirect(`/change-password/${id}`)
    }
    try {
        const info = await user.changePassword(previousPassword, password)
        console.log(info);
    }
    catch (err) {
        req.flash("error", "Password is incorrect")
        return res.redirect(`/change-password/${id}`)
    }
    const mail = {
        from: process.env.transporter_email,
        to: user.email,
        subject: "Password change on yelp-camp",
        text: `
            You are receiving this because you (or someone else) have changed your yelpCamp password.
        `
    }
    transporter.sendMail(mail)
    res.redirect(`/users/${id}`)
}

module.exports.forgetPasswordForm = (req, res) => {
    res.render("users/forgot-password")
}

module.exports.forgetPassword = async (req, res) => {
    const { username } = req.body
    const user = await User.findOne({ username }, ["email"])
    if (!user) {
        req.flash("error", "there's is no user with such a username")
        return res.redirect("/forgot-password")
    }
    const token = crypto.randomBytes(20).toString("hex")
    const link = 'http://' + req.headers.host + '/reset-password/' + token + '\n\n'
    const message = {
        from: process.env.transporter_email,
        to: user.email,
        subject: "Password reset on yelp-camp",
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            link +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n',
    }
    const info = await transporter.sendMail(message)
    user.resetPasswordToken = token
    user.resetPasswordTokenExpiresAt = Date.now() + 1000 * 60 * 15
    await user.save()
    req.flash("success", "reset password link is sent to your email \n please verify your email")
    return res.redirect("/forgot-password")
}

module.exports.resetPasswordForm = async (req, res) => {
    const { token } = req.params
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordTokenExpiresAt: { $gt: Date.now() } })
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect("/forgot-password")
    }
    res.render("users/reset-password", { token })
}

module.exports.resetPassword = async (req, res) => {
    const { token } = req.params
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordTokenExpiresAt: { $gt: Date.now() } })
    if (!user) {
        req.flash('error', 'reset token is invalid or has expired.');
        return res.redirect("/forgot-password")
    }
    const { password, confirm } = req.body
    if (password !== confirm) {
        req.flash("error", "password and password confirmation do not match")
        return res.redirect(`/reset-password/${token}`)
    }
    await user.setPassword(password)
    user.resetPasswordToken = null
    user.resetPasswordTokenExpiresAt = null
    await user.save()
    const message = {
        from: process.env.transporter_email,
        to: user.email,
        subject: "Password reset on yelp-camp",
        text: "your password has been reset successfully"
    }
    const info = await transporter.sendMail(message)
    req.logIn(user, (err) => {
        if (err) {
            throw err
        }
        req.flash("success", "password reset successfully")
        res.redirect("/campgrounds")
    })
}

module.exports.contactForm = (req, res) => {
    res.render("users/contact")
}

module.exports.contact = async (req, res) => {
    const { name, email, subject, message } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        req.flash("error", "there's no user with such email")
        return res.redirect("/contact")
    }
    const mail = {
        to: process.env.transporter_email,
        from: email,
        subject: "User help on yelp-camp",
        text: `
            username:   ${name}\n 
            email:   ${email}\n 
            subject:    ${subject}\n
            ${message}
        `
    }
    const info = await transporter.sendMail(mail)
    req.flash("success", "an email  has been sent successfully to the administration")
    res.redirect('/')
}