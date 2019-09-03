const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shipmentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    service: String,
    customsReference: String,
    description: String,
    origin: {
		name: String,
		address: String,
		zip: String,
		city:String,
		state: String,
		country: String,
		serviceArea: String
    },
    destination: {
		name: String,
		address: String,
		zip: String,
		city:String,
		state: String,
		country: String,
		serviceArea: String
	}
}, { collection:'shipments' });

mongoose.model('Shipment', shipmentSchema);