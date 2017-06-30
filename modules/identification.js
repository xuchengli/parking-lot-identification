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
    bindStreetView(cameraId, streetViewId) {
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
    unbindStreetView(streetViewId) {
        return new Promise((resolve, reject) => {
            Identification.findOneAndRemove(
                { street_view: streetViewId },
                { select: { _id: 0, camera: 1, parking_lots: 1 } },
            (err, identification) => {
                if (err) reject(err);
                var parkingLots = identification["parking_lots"];
                resolve({
                    camera: identification["camera"],
                    parking_lots: parkingLots.map(parkingLot => parkingLot["_map"])
                });
            });
        });
    }
    findAll() {
        return new Promise((resolve, reject) => {
            Identification.find({}, (err, identifications) => {
                if (err) reject(err);
                var resp = {};
                for (let identification of identifications) {
                    resp[identification["camera"]] = {
                        street_view: {
                            id: identification["street_view"]
                        }
                    };
                    var parkingLots = identification["parking_lots"];
                    for (let p of parkingLots) {
                        resp[p["_map"]] = {
                            no: p["no"],
                            camera: identification["camera"],
                            street_view: {
                                id: identification["street_view"],
                                parking_lot: p["_street_view"]
                            }
                        };
                        resp[p["_street_view"]] = {
                            no: p["no"],
                            street_view: identification["street_view"],
                            osm: {
                                camera: identification["camera"],
                                parking_lot: p["_map"]
                            }
                        };
                    }
                }
                resolve(resp);
            });
        });
    }
    findStreetViews() {
        return new Promise((resolve, reject) => {
            Identification.aggregate(
                { $match: {} },
                { $project: { _id: 0, street_view: 1 } },
            (err, streetViews) => {
                if (err) reject(err);
                resolve(streetViews.map(streetView => streetView.street_view));
            });
        });
    }
}
module.exports = identification;