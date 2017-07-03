/**
 * Created by lixuc on 2017/6/5.
 */
import $ from "jquery";
import UIkit from "uikit";
import Map from "ol/map";
import View from "ol/view";
import Zoom from "ol/control/zoom";
import TileLayer from "ol/layer/tile";
import VectorLayer from "ol/layer/vector";
import OSM from "ol/source/osm";
import VectorSource from "ol/source/vector";
import GeoJsonFormat from "ol/format/geojson";
import Style from "ol/style/style";
import Fill from "ol/style/fill";
import Stroke from "ol/style/stroke";
import Icon from "ol/style/icon";
import Text from "ol/style/text";
import Select from "ol/interaction/select";
import Condition from "ol/events/condition";

const events = Object.freeze({
    SHOW_STREET_VIEW: Symbol("showStreetView"),
    SELECT_PARKING_LOT: Symbol("selectParkingLot")
});
function createCameraStyle(src, img) {
    return new Style({
        image: new Icon({
            crossOrigin: "anonymous",
            src: src,
            img: img,
            imgSize: img ? [img.width, img.height] : undefined
        })
    });
}
var highlightedCameraStyle = {};
function changePixel(img, offset) {
    var canvas = $("<canvas>")[0];
    var context = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0, ii = data.length; i < ii; i = i + 4) {
        data[i] = Math.abs(data[i] - offset);
    }
    context.putImageData(imageData, 0, 0);
    return canvas;
}
function _highlightCamera(src, img) {
    return new Promise((resolve, reject) => {
        if (highlightedCameraStyle[src]) {
            resolve(highlightedCameraStyle[src]);
        } else {
            if (img) {
                var canvas = changePixel(img, 255);
                highlightedCameraStyle[src] = createCameraStyle(undefined, canvas);
                resolve(highlightedCameraStyle[src]);
            } else {
                img = new Image;
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    var canvas = changePixel(img, 255);
                    highlightedCameraStyle[src] = createCameraStyle(undefined, canvas);
                    resolve(highlightedCameraStyle[src]);
                };
                img.src = src;
            }
        }
    });
}
var map, select;
class osm {
    constructor() {
        var _callback = {};
        this.callback = () => _callback;
    }
    get events() {
        return events;
    }
    on(evt, cb) {
        this.callback()[evt] = cb;
    }
    load(id) {
        $.ajax({
            type: "GET",
            url: "/api/osm/" + id,
            dataType: "json",
            success: data => {
                if (data.success) {
                    var layers = [
                        new TileLayer({
                            source: new OSM()
                        })
                    ];
                    for (let layer of data.vectorLayers) {
                        layers.push(new VectorLayer({
                            name: layer.name,
                            source: new VectorSource({
                                features: new GeoJsonFormat().readFeatures(layer.featureCollection)
                            }),
                            style: function(feature, resolution) {
                                var property = feature.getProperties();
                                if (feature.getGeometry().getType() == "Point") {
                                    var src = "http://emap.crl.ibm.com/imd/" + property.icon;
                                    if (property.identification) {
                                        _highlightCamera(src).then(style => feature.setStyle(style));
                                    } else {
                                        feature.setStyle(createCameraStyle(src, undefined));
                                    }
                                } else {
                                    var _style = {
                                        fill: new Fill({ color: "#F7F5F2" }),
                                        stroke: new Stroke({ color: "#3399CC" })
                                    };
                                    if (property.identification) {
                                        return new Style(Object.assign(_style, {
                                            text: new Text({
                                                text: property.identification.no + "",
                                                font: "12px Calibri,sans-serif",
                                                fill: new Fill({ color: "#847574" }),
                                                stroke: new Stroke({ color: "#fff", width: 3 })
                                            })
                                        }));
                                    } else {
                                        return new Style(_style);
                                    }
                                }
                            }
                        }));
                    }
                    map = new Map({
                        target: "tiledMap",
                        layers: layers,
                        controls: [new Zoom()],
                        view: new View({
                            projection: "EPSG:4326",
                            center: data.tileLayer.center,
                            zoom: data.tileLayer.zoom
                        })
                    });
                    select = new Select({
                        toggleCondition: Condition.never,
                        filter: feature => feature.getGeometry().getType() != "Point"
                    });
                    map.addInteraction(select);
                    select.on("select", e => {
                        if (e.selected.length) {
                            var cb = this.callback()[events.SELECT_PARKING_LOT];
                            if (cb) cb(e.selected[0]);
                        }
                    });
                    map.on("pointermove", e => {
                        if (e.dragging) return;
                        var pixel = map.getEventPixel(e.originalEvent);
                        var hit = map.hasFeatureAtPixel(pixel);
                        $(map.getTargetElement()).css("cursor", hit ? "pointer" : "");
                    });
                    map.on("click", e => {
                        var feature = map.forEachFeatureAtPixel(e.pixel, feature => feature);
                        if (feature && feature.getGeometry().getType() == "Point") {
                            var cb = this.callback()[events.SHOW_STREET_VIEW];
                            if (cb) cb(feature);
                        }
                    });
                } else {
                    UIkit.notification("<span uk-icon='icon: close'></span> " + data.message, "danger");
                }
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                UIkit.notification("<span uk-icon='icon: close'></span> " + errorThrown, "danger");
            }
        });
    }
    getFeatureById(id) {
        var feature = null;
        var layers = map.getLayers().getArray();
        for (let layer of layers) {
            if (layer instanceof VectorLayer) {
                feature = layer.getSource().getFeatureById(id);
                if (feature) break;
            }
        }
        return feature;
    }
    highlightCamera(cameraId, streetViewId) {
        var camera = this.getFeatureById(cameraId);
        if (camera) {
            camera.set("identification", {
                street_view: {
                    id: streetViewId
                }
            }, true);
            var image = camera.getStyle().getImage().getImage();
            _highlightCamera(image.src, image).then(style => camera.setStyle(style));
        }
    }
    normalizeCamera(id) {
        var camera = this.getFeatureById(id);
        if (camera) {
            camera.unset("identification", true);
            var image = camera.getStyle().getImage().getImage();
            camera.setStyle(createCameraStyle(undefined, changePixel(image, 255)));
        }
    }
    normalizeParkingLot(id) {
        var parkingLot = this.getFeatureById(id);
        if (parkingLot) {
            parkingLot.unset("identification", true);
            parkingLot.setStyle(new Style({
                fill: new Fill({ color: "#F7F5F2" }),
                stroke: new Stroke({ color: "#3399CC" })
            }));
        }
    }
    clearSelection() {
        select.getFeatures().clear();
    }
}
export default osm;