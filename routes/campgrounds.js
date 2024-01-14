const express = require("express")
const asyncHandler = require("../utilities/asyncHandler")
const validationMiddleware = require("../middlewares/validationMiddleware")
const campgroundValidationSchema = require("../validators/campgroundValidationSchema")
const { ensureAuthenticated, isCampgroundOwner } = require("../middlewares/authenticationMiddlewares")
const campgroundController = require("../controllers/campgroundController")
const upload = require("../middlewares/uploadCloudinaryMiddleware")

const router = express.Router()


// resource: Campground
// index -- GET /campgrounds --display all campgrounds
//map -- GET /campgrounds/map --map to display all campgrounds 
// new -- GET /campgrounds/new --form to create a new campground
// create -- POST /campgrounds --create a new campground
// show -- GET /campgrounds/:id --details for a specific campground
// edit -- GET /campgrounds/:id/edit --form to edit a specific campground
// update-- PUT /campgrounds/:id --update a specific campground
// delete -- DELETE /campgrounds/:id --delete a specific campground

router.route("/")
    // index -- GET /campgrounds --display all campgrounds
    .get(asyncHandler(campgroundController.index))
    // create -- POST /campgrounds --create a new campground
    .post(
        ensureAuthenticated,
        upload.array('images'),
        validationMiddleware(campgroundValidationSchema),
        asyncHandler(campgroundController.create)
    )

//map -- GET /campgrounds/map --map to display all campgrounds 
router.get("/map", asyncHandler(campgroundController.campgroundsMap))

// new -- GET /campgrounds/new --form to create a new campground
router.get("/new", ensureAuthenticated, campgroundController.newForm)

router.route("/:id")
    // show -- GET /campgrounds/:id --details for a specific campground
    .get(asyncHandler(campgroundController.show))
    // update-- PUT /campgrounds/:id --update a specific campground
    .put(
        ensureAuthenticated,
        isCampgroundOwner,
        upload.array('images'),
        validationMiddleware(campgroundValidationSchema),
        asyncHandler(campgroundController.update)
    )
    // delete -- DELETE /campgrounds/:id --delete a specific campground
    .delete(ensureAuthenticated, isCampgroundOwner, asyncHandler(campgroundController.delete))

// edit -- GET /campgrounds/:id/edit --form to edit a specific campground
router.get("/:id/edit", ensureAuthenticated, isCampgroundOwner, asyncHandler(campgroundController.editForm))

router.get(
    "/:id/images/edit",
    ensureAuthenticated,
    isCampgroundOwner,
    asyncHandler(campgroundController.editImages)
)

router.put(
    "/:id/images",
    ensureAuthenticated,
    isCampgroundOwner,
    upload.array("images"),
    asyncHandler(campgroundController.updateImages)
)


module.exports = router