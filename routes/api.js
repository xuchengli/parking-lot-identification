/**
 * Created by lixuc on 2017/6/2.
 */
var express = require("express");
var Map = require("../modules/map");

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
                })
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
module.exports = router;