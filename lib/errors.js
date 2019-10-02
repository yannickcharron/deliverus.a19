const createError = require('http-errors');

module.exports = (app) => {
    app.use((err, req, res, next) => {

        const error = {
            "developerMessage": err.stack,
            "userMessage": err.message,
            "errorCode": err.statusCode || err.status,
            "moreInfo": "Lien internet"
        }

        console.log(err);
        res.status(error.errorCode).json(error);

    });
}