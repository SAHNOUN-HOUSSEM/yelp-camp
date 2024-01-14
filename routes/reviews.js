const express = require("express")
const asyncHandler = require("../utilities/asyncHandler")
const validationMiddleware = require("../middlewares/validationMiddleware")
const reviewValidationSchema = require("../validators/reviewValidationSchema")
const { ensureAuthenticated, isReviewOwner } = require("../middlewares/authenticationMiddlewares")
const reviewController = require("../controllers/reviewController")

const router = express.Router({ mergeParams: true })


//Review's routes
//create POST /campgrounds/:campgroundId/reviews
//delete DELETE /campgrounds/:campgroundId/reviews/:reviewId

//index -- GET /campgrounds/:campgroundId/reviews --display all reviews for a particular campground
router.get(
    "/",
    asyncHandler(reviewController.index)
)

//pagination -- GET /campgrounds/:campgroundId/reviews/api --api to return paginated reviews of a particular campground
router.get(
    "/api",
    asyncHandler(reviewController.paginationAPI)
)

//POST /campgrounds/:campgroundId/reviews
router.post(
    "/",
    ensureAuthenticated,
    validationMiddleware(reviewValidationSchema),
    asyncHandler(reviewController.create)
)

//delete DELETE /campgrounds/:campgroundId/reviews/:reviewId
router.delete(
    "/:reviewId",
    ensureAuthenticated,
    isReviewOwner,
    asyncHandler(reviewController.delete)
)

module.exports = router