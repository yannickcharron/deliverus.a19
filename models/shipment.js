const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shipmentSchema = new Schema({
	_id: Schema.Types.ObjectId,
	tracking: {
		type:String,
		unique:true
	},
    service: String,
    customsReference: String,
	description: String,
	shipDate: Date,
	estimatedDeliveryDate: Date,
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