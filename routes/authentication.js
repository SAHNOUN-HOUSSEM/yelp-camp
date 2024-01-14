const express = require("express")
const passport = require("passport")
const asyncHandler = require("../utilities/asyncHandler")
const { setReturnTo, ensureGuest, ensureAuthenticated, isAccountOwner } = require("../middlewares/authenticationMiddlewares")
const authenticationController = require("../controllers/authenticationController")
const validationMiddleware = require("../middlewares/validationMiddleware")
const userRegistrationValidationSchema = require("../validators/userRegistrationValidationSchema")
const upload = require("../middlewares/uploadCloudinaryMiddleware")

const router = express.Router()

router.route("/register")
    .get(authenticationController.registerForm)
    .post(
        upload.single("avatar"),
        validationMiddleware(userRegistrationValidationSchema),
        asyncHandler(authenticationController.register)
    )

router.route("/login")
    .get(authenticationController.loginForm)
    .post(
        setReturnTo,
        passport.authenticate(
            'local',
            {
                failureFlash: true,
                failureRedirect: "/login",
            }
        ),
        authenticationController.login
    )

router.post("/logout", authenticationController.logout)

router.route("/change-password/:id")
    .get(
        ensureAuthenticated,
        isAccountOwner,
        asyncHandler(authenticationController.changePasswordForm)
    )
    .post(
        ensureAuthenticated,
        isAccountOwner,
        asyncHandler(authenticationController.changePassword)
    )

router.route("/forgot-password")
    .get(
        ensureGuest,
        authenticationController.forgetPasswordForm
    )
    .post(
        ensureGuest,
        asyncHandler(authenticationController.forgetPassword)
    )

router.route('/reset-password/:token')
    .get(
        ensureGuest,
        asyncHandler(authenticationController.resetPasswordForm)
    )
    .post(
        ensureGuest,
        asyncHandler(authenticationController.resetPassword)
    )

router.route("/contact")
    .get(
        ensureAuthenticated,
        authenticationController.contactForm
    )
    .post(
        ensureAuthenticated,
        asyncHandler(authenticationController.contact)
    )

module.exports = router