/**
 * Created by lixuc on 2017/6/2.
 */
var express = require("express");
var Map = require("../modules/map");
var StreetView = require("../modules/street-view");
var Identification = require("../modules/identification");

var router = express.Router();

router.get("/osm/:id", (req, res) => {
    var map = new Map(req.params.id);
    var resp = {};
    map.getAllFeatures().then(result => {
        Object.assign(resp, { success: true });
        var layers = result.layers;
        var vectorLayers = [];
        for (let layer of layers) {
            if (layer["class"] == "WMS") {
                Object.assign(resp, {
                    tileLayer: {
                        name: layer["name"],
                        center: layer["properties"]["center"],
                        zoom: layer["properties"]["zoom"]
                    }
                });
            } else if (layer["class"] == "VECTOR") {
                vectorLayers.push({
                    name: layer["name"],
                    featureCollection: layer["featureCollection"]
                });
            }
        }
        Object.assign(resp, { vectorLayers: vectorLayers });
        var identification = new Identification();
        return identification.findAll();
    }).then(result => {
        var identification = {};
        for (let i of result) {
            identification[i["camera"]] = i["street_view"];
            var parkingLots = i["parking_lots"];
            for (let p of parkingLots) {
                identification[p["_map"]] = {
                    no: p["no"],
                    camera: i["camera"],
                    street_view: {
                        id: i["street_view"],
                        parking_lot: p["_street_view"]
                    }
                }
            }
        }
        res.json(Object.assign(resp, {
            identification: identification
        }));
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, err));
    });
});
router.get("/street-views", (req, res) => {
    var streetView = new StreetView();
    var resp = {};
    streetView.list().then(result => {
        Object.assign(resp, { success: true });
        var list = [];
        for (var i in result) {
            list.push({
                id: result[i]["id"],
                name: result[i]["name"]
            });
        }
        res.json(Object.assign(resp, {
            views: list
        }))
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, err));
    });
});
router.post("/street-view/open", (req, res) => {
    var identification = new Identification();
    var resp = {};
    identification.identifyStreetView(req.body.camera, req.body.street_view).then(result => {
        var map = new Map(result.street_view);
        return map.getAllFeatures();
    }).then(result => {
        Object.assign(resp, { success: true });
        var layers = result.layers;
        var vectorLayers = [];
        for (var i in layers) {
            if (layers[i]["class"] == "IMAGE") {
                Object.assign(resp, {
                    imageLayer: {
                        name: layers[i]["name"],
                        url: layers[i]["url"],
                        extent: layers[i]["extent"]
                    }
                });
            } else if (layers[i]["class"] == "VECTOR") {
                vectorLayers.push({
                    name: layers[i]["name"],
                    featureCollection: layers[i]["featureCollection"]
                });
            }
        }
        res.json(Object.assign(resp, {
            vectorLayers: vectorLayers
        }));
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, {
            message: err.message
        }));
    });
});
module.exports = router;