const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;

const packageSchema = new mongoose.Schema({
    description: String,
    weight: Number,
    shipment: {
        type: Schema.Types.ObjectId,
        ref: 'Shipment'
    }
},{
    collection: 'packages',
    toJSON: {
        transform: function(doc, ret) {

            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

packageSchema.methods.linking = function(tracking, isShipmentObjectPresent = true) {
    
    const _id = this._id;
    const shipmentHref = `${config.api.baseUrl}/shipments/${tracking}`;
    const linkedPackage = this.toJSON();
    linkedPackage.href = `${shipmentHref}/packages/${_id}`;
    if(isShipmentObjectPresent) {
        linkedPackage.shipment = {}
        linkedPackage.shipment.href = shipmentHref;
    } else {
        delete linkedPackage.shipment;
    }

    return linkedPackage;
}

mongoose.model('Package', packageSchema);