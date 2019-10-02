const config = require('config');
const express = require('express');
const crypto = require('crypto');
const moment = require('moment');
const passport = require('passport');
const mongoose =  require('mongoose');
const createError = require('http-errors');
const expressJwt = require('express-jwt');

const router = express.Router();
const Account = mongoose.model('Account');

const authentificator = expressJwt({
    secret:config.api.jwtSecret,
    userProperty: 'account'
});

router.get('/', authentificator, async (req, res, next) => {

    console.log(req.account);
    if(!req.account._id) {
        res.status(401).end();
    } else {
        let account = await Account.findById(req.account._id);
        res.status(200).json(account);
    }
})


router.post('/login', passport.authenticate('local'), async (req, res, next) => {
    
    if(req.user) {
        res.status(200).json({
            "token":req.user.generateJwt()
        });
    }
});

router.post('/', async (req, res, next) => {
    const account = new Account(req.body);

    try {
        account.hashPassword(req.body.password);
        account.createdDate = moment();
        const savedAccount = await account.save();

        res.status(201);
        res.json(savedAccount);
    } catch (err) {
        next(new createError.InternalServerError(err.message));
    }
});

router.get('/bitcoin', async (req, res, next) => {

    const ac = {
        nom:'Yannick',
        no:0,
        date: moment()
    }

    let hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(ac));
    let valeurHashee = hash.digest('hex');
    console.log(valeurHashee);

    while(valeurHashee.substring(0,12) !== '000000000000') {

        let hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(ac));
        ac.no += 1;
        ac.date = moment()

        valeurHashee = hash.digest('hex');
        console.log(valeurHashee);
    }

});

module.exports = router;