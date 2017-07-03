/**
 * Created by lixuc on 2017/6/8.
 */
import $ from "jquery";
import UIkit from "uikit";
import Map from "ol/map";
import View from "ol/view";
import Zoom from "ol/control/zoom";
import Projection from "ol/proj/projection";
import Extent from "ol/extent";
import ImageLayer from "ol/layer/image";
import VectorLayer from "ol/layer/vector";
import ImageStaticSource from "ol/source/imagestatic";
import VectorSource from "ol/source/vector";
import GeoJsonFormat from "ol/format/geojson";
import Style from "ol/style/style";
import Fill from "ol/style/fill";
import Stroke from "ol/style/stroke";
import Text from "ol/style/text";
import Color from "ol/color";
import Select from "ol/interaction/select";
import Condition from "ol/events/condition";

const events = Object.freeze({
    SELECT_PARKING_LOT: Symbol("selectParkingLot")
});
var map;
class streetView {
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
    open(streetViewId, cameraId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "/api/street-view/" + streetViewId,
                data: {
                    camera: cameraId
                },
                dataType: "json",
                success: data => {
                    if (data.success) {
                        if (map) {
                            map.setTarget(null);
                            map = null;
                        }
                        var extent = data.imageLayer.extent;
                        var projection = new Projection({
                            code: "street-view-image",
                            units: "pixels",
                            extent: extent
                        });
                        var layers = [
                            new ImageLayer({
                                name: data.imageLayer.name,
                                source: new ImageStaticSource({
                                    url: "http://emap.crl.ibm.com/imd/" + data.imageLayer.url,
                                    projection: projection,
                                    imageExtent: extent
                                })
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
                                    var _style = {
                                        fill: new Fill({
                                            color: Color.asArray("#F7F5F2").slice(0, -1).concat(.6)
                                        }),
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
                            }));
                        }
                        map = new Map({
                            target: "streetView",
                            layers: layers,
                            controls: [new Zoom()],
                            view: new View({
                                projection: projection,
                                center: Extent.getCenter(extent),
                                zoom: 1,
                                minZoom: 1,
                                maxZoom: 2
                            })
                        });
                        var select = new Select({
                            toggleCondition: Condition.never,
                            filter: feature => feature.getGeometry().getType() != "Point"
                        });
                        map.addInteraction(select);
                        select.on("select", e => {
                            if (e.selected.length) {
                                let cb = this.callback()[events.SELECT_PARKING_LOT];
                                if (cb) cb(e.selected[0]);
                            }
                        });
                        map.on("pointermove", e => {
                            if (e.dragging) return;
                            var pixel = map.getEventPixel(e.originalEvent);
                            var hit = map.hasFeatureAtPixel(pixel);
                            $(map.getTargetElement()).css("cursor", hit ? "pointer" : "");
                        });
                        resolve({
                            camera: cameraId,
                            street_view: streetViewId
                        });
                    } else {
                        reject(data.message);
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    }
    close(streetViewId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "/api/street-view/" + streetViewId,
                dataType: "json",
                success: data => {
                    if (data.success) {
                        if (map) {
                            map.setTarget(null);
                            map = null;
                        }
                        resolve({
                            camera: data.camera,
                            parking_lots: data.parking_lots
                        });
                    } else {
                        reject(data.message);
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    }
}
export default streetView;