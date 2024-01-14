const express = require("express")
const asyncHandler = require("../utilities/asyncHandler")
const upload = require("../middlewares/uploadCloudinaryMiddleware")
const userController = require("../controllers/userController")
const { ensureAuthenticated, isAccountOwner } = require("../middlewares/authenticationMiddlewares")

const router = express.Router()

router.route("/:id/edit")
    .get(
        ensureAuthenticated,
        isAccountOwner,
        asyncHandler(userController.editForm)
    )

router.route("/:id")
    .get(asyncHandler(userController.show))
    .put(
        ensureAuthenticated,
        isAccountOwner,
        upload.single("avatar"),
        asyncHandler(userController.update)
    )

module.exports = router