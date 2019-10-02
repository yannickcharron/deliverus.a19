const mongoose = require('mongoose');
const config = require('config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const accountSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    firstname: String,
    lastname: String,
    hash: String,
    salt: String,
    createdDate: Date
}, {
    collection: 'accounts',
    toJSON: {
        transform : (doc, ret) => {
            delete ret._id;
            delete ret.salt;
            delete ret.hash;
            delete ret.__v;
        }
    }
});

accountSchema.methods.hashPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('base64');
}

accountSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('base64');
    return this.hash === hash;
}

accountSchema.methods.generateJwt = function () {
    // let dateExpiration = moment().add(7, 'days');
    // let secondes = moment.duration(dateExpiration).asSeconds();
    let dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 7);


    return jwt.sign({
        _id:this._id,
        email: this.email,
        name: `${this.firstname} ${this.lastname}`,
        exp: parseInt(dateExpiration.getTime() / 1000)
    }, config.api.jwtSecret);
    
}

mongoose.model('Account', accountSchema);