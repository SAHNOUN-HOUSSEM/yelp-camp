const Joi = require("./Joi");
const addressValidationSchema = require("./addressValidationSchema");

const userRegistrationValidationSchema = Joi.object({
    user:Joi.object({
        email: Joi.string().trim().regex(/^\S+@\S+\.\S+$/).required(),
        username: Joi.string().trim().required(),
        firstname: Joi.string().trim().required(),
        lastname: Joi.string().trim().required(),
        phone: Joi.number().integer().min(0),
        address:addressValidationSchema
    }).required()
})

module.exports=userRegistrationValidationSchema