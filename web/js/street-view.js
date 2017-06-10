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
import Color from "ol/color";
import Select from "ol/interaction/select";
import Condition from "ol/events/condition";

const events = Object.freeze({
    SELECT_PARKING_LOT: Symbol("selectParkingLot")
});
const callback = {};
class streetView {
    static get events() {
        return events;
    }
    on(evt, cb) {
        callback[evt] = cb;
    }
    load(cameraId, streetViewId) {
        $.ajax({
            type: "POST",
            url: "/api/street-view/open",
            data: {
                camera: cameraId,
                street_view: streetViewId
            },
            dataType: "json",
            success: data => {
                if (data.success) {
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
                    for (var i in data.vectorLayers) {
                        var layer = data.vectorLayers[i];
                        layers.push(new VectorLayer({
                            name: layer.name,
                            source: new VectorSource({
                                features: new GeoJsonFormat().readFeatures(layer.featureCollection)
                            }),
                            style: function(feature, resolution) {
                                return new Style({
                                    fill: new Fill({
                                        color: Color.asArray("#F7F5F2").slice(0, -1).concat(.6)
                                    }),
                                    stroke: new Stroke({ color: "#3399CC" })
                                });
                            }
                        }));
                    }
                    var map = new Map({
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
                } else {
                    UIkit.notification("<span uk-icon='icon: close'></span> " + data.message, "danger");
                }
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                UIkit.notification("<span uk-icon='icon: close'></span> " + errorThrown, "danger");
            }
        });
    }
}
export default streetView;