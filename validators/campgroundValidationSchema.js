const Joi = require("./Joi")

const campgroundValidationSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required()
})

module.exports = campgroundValidationSchema