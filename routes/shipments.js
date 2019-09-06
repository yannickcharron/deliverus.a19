const moment = require('moment');
const express = require('express');
const mongoose = require('mongoose');
const createError = require('http-errors');
const randomString = require('randomstring');

const router = express.Router();

const Shipment = mongoose.model('Shipment');
const ObjectId = mongoose.Types.ObjectId;

router.get('/:tracking', async (req, res, next) => {
    console.log(req.params.tracking);
    try {
        let shipments = await Shipment.find({
            tracking: req.params.tracking
        });
        if (shipments.length === 0) {
            next(new createError.NotFound());
        }
        res.status(200).json(shipments[0]);
    } catch (err) {
        next(new createError.InternalServerError(err.message));
    }
});

router.get('/', async (req, res, next) => {

    let limit = 5;
    let offset = 0;
    //Gestion du batching/paging
    if (req.query.limit && req.query.offset) {
        limit = parseInt(req.query.limit, 10);
        offset = parseInt(req.query.offset, 10);

        if (isNaN(limit) || isNaN(offset)) {
            next(new createError.BadRequest('Invalid format for limit or offset'));
        }
    }

    try {
        let fields = {};
        let filter = {};
        if(req.query.fields) {
            fields = req.query.fields.replace(/,/g, ' ');
            fields = `${fields} tracking`
        }

        if(req.query.service) {
            filter.service = req.query.service
        }

        let results = await Promise.all([
            Shipment.find(filter, fields)
                .sort({ 'shipDate': -1 }).limit(limit).skip(offset),
            Shipment.countDocuments()
        ])
        //let total = await Shipment.estimatedDocumentCount();

        let responseBody = {};
        
        responseBody.metadata = {};
        responseBody.metadata.resultset = {
            count: results[0].length,
            limit: limit,
            offset: offset,
            total: results[1]
        }

        responseBody.results = results[0];

        res.status(200).json(responseBody);

    } catch (err) {
        next(new createError.InternalServerError(err.message));
    }
});

router.post('/', async (req, res, next) => {

    const newShipment = new Shipment(req.body);
    newShipment._id = new ObjectId();
    newShipment.shipDate = new moment();
    newShipment.tracking = randomString.generate(18);
    //TODO: Validation
    let shipDate = moment(newShipment.shipDate)
    if (newShipment.service === "Express") {
        newShipment.estimatedDeliveryDate = shipDate.add('3', 'days');
    } else if (newShipment.service === "Normal") {
        newShipment.estimatedDeliveryDate = shipDate.add('5', 'days');
    } else {
        newShipment.estimatedDeliveryDate = shipDate.add('7', 'days');
    }

    try {
        let saveShipment = await newShipment.save();
        res.status(201);
        if (req.query._body === "false") {
            res.end();
        } else {
            res.json(saveShipment);
        }

    } catch (err) {
        console.log(err);
    }

});



module.exports = router;