const ExpressError = require("../utilities/ExpressError")

const validationMiddleware = (validationSchema) => {
    return (req, res, next) => {
        const { error } = validationSchema.validate(req.body, { stripUnknown: true })
        if (error) {
            const message = error.details.map(err => err.message).join(' , ')
            throw new ExpressError(message, 400)
        }
        next()
    }
}

module.exports=validationMiddleware