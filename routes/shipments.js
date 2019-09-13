const moment = require('moment');
const express = require('express');
const mongoose = require('mongoose');
const createError = require('http-errors');
const randomString = require('randomstring');

const router = express.Router();

const Shipment = mongoose.model('Shipment');
const Package = mongoose.model('Package');
const ObjectId = mongoose.Types.ObjectId;

router.get('/:tracking', async (req, res, next) => {

    try {

        let shipmentQuery = Shipment.find({tracking: req.params.tracking});
        if (req.query.expand === 'packages') {
            shipmentQuery.populate('packages');
        }

        let shipments = await shipmentQuery;

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
        if (req.query.fields) {
            fields = req.query.fields.replace(/,/g, ' ');
            fields = `${fields} tracking`
        }

        if (req.query.service) {
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
    //newShipment._id = new ObjectId();
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

    let activity = {
        description: 'Shipment created',
        location: 'Unknown',
        activityDate: moment()
    }
    newShipment.activities.push(activity);

    try {
        let saveShipment = await newShipment.save();
        res.status(201);

        if (req.query._body === "false") {
            res.end();
        } else {
            saveShipment = saveShipment.toJSON();
            res.header('Location', saveShipment.href);
            res.json(saveShipment);
        }

    } catch (err) {
        console.log(err);
    }

});


router.post('/:tracking/activities', async (req, res, next) => {

    try {
        //1. Trouver le shipment avec :tracking
        let shipment = await Shipment.findOne({ tracking: req.params.tracking });
        if (shipment === null) {
            //1.a -> Pas de shipment avec le :tracking => 404
            next(new createError.NotFound(`Le shipment avec le tracking ${req.params.tracking} n'existe pas.`));
        }

        //2. Créer les activity
        let activity = req.body;
        activity.activityDate = moment();
        //3. Ajouter l'activity au shipment 
        shipment.activities.push(activity);

        //4. Sauvegarder l'activity
        const savedShipment = await shipment.save();
        //5. Réponse au client => 201 + Header Location
        res.status(201);
        const responseBody = savedShipment.toJSON();
        res.header('Location', responseBody.href);
        res.json(responseBody);

    } catch (err) {
        next(new createError.InternalServerError(err.message));
    }
});

router.post('/:tracking/packages', async (req, res, next) => {
    try {
        //1. Trouver le shipment avec :tracking
        let shipment = await Shipment.findOne({ tracking: req.params.tracking });
        if (shipment) {
            //2. Créer un package
            let newPackage = new Package(req.body);
            //3. Associer le _id du shipment au package
            newPackage.shipment = shipment._id; // Création de la relation

            //4. Sauvegarder le package
            let savedPackage = await newPackage.save();

            //5. Reponse 201 + Header Location
            savedPackage = savedPackage.linking(req.params.tracking)
            res.header('Location', savedPackage.href);
            res.status(201).json(savedPackage);

        } else {
            next(new createError.NotFound(`Le shipment avec le tracking ${req.params.tracking} n'existe pas.`));
        }
    } catch (err) {
        next(new createError.InternalServerError(err.message));
    }





});


router.delete('/', (req, res, next) => {
    next(new createError.MethodNotAllowed());
});

router.patch('/', (req, res, next) => {
    next(new createError.MethodNotAllowed());
});

router.put('/', (req, res, next) => {
    next(new createError.MethodNotAllowed());
});



module.exports = router;