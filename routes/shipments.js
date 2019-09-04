const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
const randomString = require('randomstring');

const Shipment = mongoose.model('Shipment');
const ObjectId = mongoose.Types.ObjectId;

router.get('/:tracking', async (req, res, next) => {
    console.log(req.params.tracking);
    try {
        let shipments = await  Shipment.find({
            tracking: req.params.tracking
        });
        if(shipments.length === 0) {
            res.status(404).end();
        }
        res.status(200).json(shipments[0]);
    } catch(err) {

    }
});

router.get('/', async (req, res, next) => {
    let shipments = await Shipment.find();
    res.status(200);
    res.json(shipments);
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
        if(req.query._body === "false") {
            res.end();
        } else {
            res.json(saveShipment);
        }
        
    } catch(err) {
        console.log(err);
    }

});



module.exports = router;