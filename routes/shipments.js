const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Shipment = mongoose.model('Shipment');

router.get('/', async (req, res, next) => {
    let shipments = await Shipment.find();
    res.status(200);
    res.json(shipments);
        
    
  
});

module.exports = router;