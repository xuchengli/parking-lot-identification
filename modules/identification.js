/**
 * Created by lixuc on 2017/6/7.
 */
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var identificationSchema = new Schema({
    camera: { type: String, unique: true },
    street_view: { type: String, unique: true },
    parking_lots: [{
        no: Number,
        _map: { type: String, unique: true, sparse: true },
        _street_view: { type: String, unique: true, sparse: true },
        timestamp: { type: Date, default: Date.now }
    }]
});
var Identification = mongoose.model("Identification", identificationSchema);

var counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
var Counter = mongoose.model("Counter", counterSchema);

class identification {
    identifyStreetView(cameraId, streetViewId) {
        return new Promise((resolve, reject) => {
            var streetViewIdentification = new Identification({
                camera: cameraId,
                street_view: streetViewId
            });
            streetViewIdentification.save((err, streetViewIdentification) => {
                if (err) reject(err);
                resolve(streetViewIdentification);
            });
        });
    }
}
module.exports = identification;