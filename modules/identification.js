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
                }
            );
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
                }
            );
        });
    }
    getNextSequence(id) {
        return new Promise((resolve, reject) => {
            Counter.findByIdAndUpdate(id, { $inc: { seq: 1 } }, { new: true, upsert: true }, (err, counter) => {
                if (err) reject(err);
                resolve(counter.seq);
            });
        });
    }
    bindParkingLot(streetViewId, no, _map, _street_view) {
        return new Promise((resolve, reject) => {
            Identification.findOneAndUpdate(
                { street_view: streetViewId },
                { $push: { parking_lots: { no: no, _map: _map, _street_view: _street_view } } },
                { new: true, fields: "-_id -__v -parking_lots._id" },
                (err, identification) => {
                    if (err) reject(err);
                    var resp = {};
                    var parkingLots = identification["parking_lots"];
                    for (let p of parkingLots) {
                        if (p["_map"] == _map && p["_street_view"] == _street_view) {
                            resp["parking_lot_map"] = {
                                id: p["_map"],
                                properties: {
                                    no: p["no"],
                                    camera: identification["camera"],
                                    street_view: {
                                        id: identification["street_view"],
                                        parking_lot: p["_street_view"]
                                    }
                                }
                            };
                            resp["parking_lot_street_view"] = {
                                id: p["_street_view"],
                                properties: {
                                    no: p["no"],
                                    street_view: identification["street_view"],
                                    osm: {
                                        camera: identification["camera"],
                                        parking_lot: p["_map"]
                                    }
                                }
                            };
                            break;
                        }
                    }
                    resolve(resp);
                }
            )
        });
    }
    unbindParkingLot(streetViewId, _map, _street_view) {
        return new Promise((resolve, reject) => {
            Identification.findOneAndUpdate(
                { street_view: streetViewId },
                { $pull: { parking_lots: { $or: [ { _map: _map }, { _street_view: _street_view } ] } } },
                { fields: "-_id -__v -parking_lots._id" },
                (err, identification) => {
                    if (err) reject(err);
                    var parkingLots_Map = [], parkingLots_StreetView = [];
                    var parkingLots = identification["parking_lots"];
                    for (let p of parkingLots) {
                        if (p["_map"] == _map || p["_street_view"] == _street_view) {
                            parkingLots_Map.push(p["_map"]);
                            parkingLots_StreetView.push(p["_street_view"]);
                        }
                    }
                    resolve({
                        parking_lots_map: parkingLots_Map,
                        parking_lots_street_view: parkingLots_StreetView
                    });
                }
            )
        });
    }
    findParkingLot_Map(_street_view) {
        return new Promise((resolve, reject) => {
            Identification.aggregate(
                { $unwind: "$parking_lots" },
                { $match: { "parking_lots._street_view": _street_view } },
                { $project: { _id: 0, "parking_lots._map": 1 } },
                (err, parkingLots) => {
                    if (err) reject(err);
                    var parkingLot_Map = "";
                    if (parkingLots.length) parkingLot_Map = parkingLots[0]["parking_lots"]["_map"];
                    resolve({
                        parking_lot_map: parkingLot_Map
                    });
                }
            );
        });
    }
}
module.exports = identification;