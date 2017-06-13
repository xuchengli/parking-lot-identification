/**
 * Created by lixuc on 2017/6/2.
 */
var express = require("express");
var co = require("co");
var Map = require("../modules/map");
var StreetView = require("../modules/street-view");
var Identification = require("../modules/identification");

var router = express.Router();
var rebuildMap = (mapInfo, identifications) => {
    var result = {};
    var layers = mapInfo.layers;
    var vectorLayers = [];
    for (let layer of layers) {
        if (layer["class"] == "WMS") {
            Object.assign(result, {
                tileLayer: {
                    name: layer["name"],
                    center: layer["properties"]["center"],
                    zoom: layer["properties"]["zoom"]
                }
            });
        } else if (layer["class"] == "IMAGE") {
            Object.assign(result, {
                imageLayer: {
                    name: layer["name"],
                    url: layer["url"],
                    extent: layer["extent"]
                }
            });
        } else if (layer["class"] == "VECTOR") {
            var features = layer["featureCollection"]["features"];
            for (let feature of features) {
                var identifiedFeature = identifications[feature.properties.id];
                if (identifiedFeature) {
                    feature.properties.identification = identifiedFeature;
                }
                feature.id = feature.properties.id;
                delete feature.properties.id;
            }
            vectorLayers.push({
                name: layer["name"],
                featureCollection: {
                    type: "FeatureCollection",
                    features: features
                }
            });
        }
    }
    return Object.assign(result, { vectorLayers: vectorLayers });
};
router.get("/osm/:id", (req, res) => {
    var resp = {};
    co(function* () {
        var identification = new Identification();
        var map = new Map(req.params.id);

        var identifications = yield identification.findAll();
        var mapInfo = yield map.getAllFeatures();

        Object.assign(resp, { success: true });
        res.json(Object.assign(resp, rebuildMap(mapInfo, identifications)));
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, err));
    });
});
router.get("/street-views", (req, res) => {
    var resp = {};
    co(function* () {
        var identification = new Identification();
        var streetView = new StreetView();

        var streetViewIds = yield identification.findStreetViews();
        var streetViews = yield streetView.list();

        Object.assign(resp, { success: true });
        var list = [];
        for (let sv of streetViews) {
            if (!streetViewIds.includes(sv["id"])) {
                list.push({
                    id: sv["id"],
                    name: sv["name"]
                });
            }
        }
        res.json(Object.assign(resp, { views: list }));
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, err));
    });
});
router.post("/street-view/identify", (req, res) => {
    var resp = {};
    co(function* () {
        var identification = new Identification();
        var identified = yield identification.identifyStreetView(req.body.camera, req.body.street_view);

        var map = new Map(identified.street_view);
        var mapInfo = yield map.getAllFeatures();

        Object.assign(resp, { success: true });
        res.json(Object.assign(resp, rebuildMap(mapInfo, {})));
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, { message: err.message }));
    });
});
router.get("/street-view/:id", (req, res) => {
    var resp = {};
    co(function* () {
        var identification = new Identification();
        var map = new Map(req.params.id);

        var identifications = yield identification.findAll();
        var mapInfo = yield map.getAllFeatures();

        Object.assign(resp, { success: true });
        res.json(Object.assign(resp, rebuildMap(mapInfo, identifications)));
    }).catch(err => {
        Object.assign(resp, { success: false });
        res.json(Object.assign(resp, err));
    });
});
module.exports = router;