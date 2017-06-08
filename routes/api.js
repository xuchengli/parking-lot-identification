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
        for (var i in layers) {
            if (layers[i]["class"] == "WMS") {
                Object.assign(resp, {
                    tileLayer: {
                        name: layers[i]["name"],
                        center: layers[i]["properties"]["center"],
                        zoom: layers[i]["properties"]["zoom"]
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