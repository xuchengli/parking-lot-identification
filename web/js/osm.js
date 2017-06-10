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
import Select from "ol/interaction/select";
import Condition from "ol/events/condition";

const events = Object.freeze({
    SHOW_STREET_VIEW: Symbol("showStreetView"),
    SELECT_PARKING_LOT: Symbol("selectParkingLot")
});
const callback = {};
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
class osm {
    static get events() {
        return events;
    }
    on(evt, cb) {
        callback[evt] = cb;
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
                                    if (data.identification[property.id]) {
                                        if (highlightedCameraStyle[src]) {
                                            feature.setStyle(highlightedCameraStyle[src]);
                                        } else {
                                            var img = new Image;
                                            var canvas = $("<canvas>")[0];
                                            var context = canvas.getContext("2d");
                                            img.crossOrigin = "Anonymous";
                                            img.onload = () => {
                                                canvas.width = img.width;
                                                canvas.height = img.height;
                                                context.drawImage(img, 0, 0);
                                                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                                                var data = imageData.data;
                                                for (var i = 0, ii = data.length; i < ii; i = i + 4) {
                                                    data[i] = 255 - data[i];
                                                }
                                                context.putImageData(imageData, 0, 0);
                                                highlightedCameraStyle[src] = createCameraStyle(undefined, canvas);
                                                feature.setStyle(highlightedCameraStyle[src]);
                                            };
                                            img.src = src;
                                        }
                                    } else {
                                        feature.setStyle(createCameraStyle(src, undefined));
                                    }
                                } else {
                                    return new Style({
                                        fill: new Fill({ color: "#F7F5F2" }),
                                        stroke: new Stroke({ color: "#3399CC" })
                                    });
                                }
                            }
                        }));
                    }
                    var map = new Map({
                        target: "tiledMap",
                        layers: layers,
                        controls: [new Zoom()],
                        view: new View({
                            projection: "EPSG:4326",
                            center: data.tileLayer.center,
                            zoom: data.tileLayer.zoom
                        })
                    });
                    var select = new Select({
                        toggleCondition: Condition.never,
                        filter: feature => feature.getGeometry().getType() != "Point"
                    });
                    map.addInteraction(select);
                    select.on("select", e => {
                        if (e.selected.length) {
                            var cb = callback[events.SELECT_PARKING_LOT];
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
                            var cb = callback[events.SHOW_STREET_VIEW];
                            if (cb) cb(feature.getProperties().id);
                        }
                    });
                } else {
                    UIkit.notification("<span uk-icon='icon: close'></span> " + data.message, "danger");
                }
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                UIkit.notification("<span uk-icon='icon: close'></span> " + errorThrown, "danger");
            }
        })
    }
}
export default osm;