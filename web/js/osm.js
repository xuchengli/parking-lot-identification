/**
 * Created by lixuc on 2017/6/5.
 */
import $ from "jquery";
import UIkit from "uikit";
import Map from "ol/map";
import View from "ol/view";
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
                    for (var i in data.vectorLayers) {
                        var layer = data.vectorLayers[i];
                        layers.push(new VectorLayer({
                            name: layer.name,
                            source: new VectorSource({
                                features: new GeoJsonFormat().readFeatures(layer.featureCollection)
                            }),
                            style: function(feature, resolution) {
                                var property = feature.getProperties();
                                if (feature.getGeometry().getType() == "Point") {
                                    return new Style({
                                        image: new Icon({
                                            src: "http://emap.crl.ibm.com/imd/" + property.icon
                                        })
                                    });
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