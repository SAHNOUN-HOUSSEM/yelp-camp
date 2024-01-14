const express = require("express")
const { ensureAuthenticated, isNotificationRecipient } = require("../middlewares/authenticationMiddlewares")
const asyncHandler = require("../utilities/asyncHandler")
const notificationController = require("../controllers/notificationController")

const router = express.Router()

router.post(
    "/follow/:id",
    ensureAuthenticated,
    asyncHandler(notificationController.follow)
)

router.get(
    "/notifications",
    ensureAuthenticated,
    asyncHandler(notificationController.index)
)

router.get(
    "/notifications/:id",
    ensureAuthenticated,
    isNotificationRecipient,
    asyncHandler(notificationController.handleNotification)
)

module.exports = router