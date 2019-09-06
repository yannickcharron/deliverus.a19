const createError = require('http-errors');

module.exports = (app) => {
    app.use((err, req, res, next) => {

        const error = {
            "developerMessage": err.stack,
            "userMessage": err.message,
            "errorCode": err.statusCode,
            "moreInfo": "Lien internet"
        }

        res.status(err.statusCode).json(error);

    });
}