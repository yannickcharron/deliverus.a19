const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;

const shipmentSchema = new Schema({
	_id: Schema.Types.ObjectId,
	tracking: {
		type: String,
		unique: true
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
		city: String,
		state: String,
		country: String,
		serviceArea: String
	},
	destination: {
		name: String,
		address: String,
		zip: String,
		city: String,
		state: String,
		country: String,
		serviceArea: String
	}
}, {
	collection: 'shipments',
	toJSON: {
		transform: function(doc, ret) {

			//Linking
			ret.href = `${config.api.baseUrl}/shipments/${doc.tracking}`;
			delete ret._id;
			ret.version = doc.__v;
			delete ret.__v;
			return ret;
		}
	}
});

mongoose.model('Shipment', shipmentSchema);