const Joi = require("./Joi");

const addressValidationSchema= Joi.object({
    country: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    town: Joi.string().trim().required(),
    zipcode: Joi.number().integer().min(1000)
})

module.exports=addressValidationSchema