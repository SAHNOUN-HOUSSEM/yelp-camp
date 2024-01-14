const errorHandlerMiddleware = (err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) {
        err.message = "Something went wrong!!!"
    }
    res.status(statusCode).render("error", { error: err })
}

module.exports = errorHandlerMiddleware