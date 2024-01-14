const Joi = require("./Joi")

const reviewValidationSchema = Joi.object({
    review: Joi.object({
        text: Joi.string().required(),
        rating: Joi.number().integer().min(1).max(5).required()
    }).required()
})


module.exports = reviewValidationSchema