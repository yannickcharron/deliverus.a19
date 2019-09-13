const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;

const shipmentSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, auto: true },
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
	},
	activities: [{
		description: String,
		location: String,
		activityDate: Date,
		details: String
	}]
}, {
	collection: 'shipments',
	toJSON: {
		transform: function (doc, ret) {
			console.log(doc);
			//Linking
			ret.href = `${config.api.baseUrl}/shipments/${doc.tracking}`;

			if(!ret.packages) {
				ret.packages = {};
				ret.packages.href = `${ret.href}/packages`;
			} else  {
				doc.packages.forEach((p, i) => {
					ret.packages[i] = p.linking(doc.tracking, false);
				});
			}

			delete ret._id;
			ret.version = doc.__v;
			delete ret.__v;

			if (ret.activities) {
				ret.activities.forEach(a => {
					delete a._id;
				});
			}

			return ret;
		},
		virtuals: true,
	}
});

shipmentSchema.virtual('packages', {
	ref: 'Package',
	localField: '_id',
	foreignField: 'shipment',
	justOne: false
});

mongoose.model('Shipment', shipmentSchema);