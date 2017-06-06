/**
 * Created by lixuc on 2017/6/1.
 */
import "uikit/dist/css/uikit.min.css";
import "ol/ol.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import Osm from "./osm";

UIkit.use(Icons);

var osm = new Osm();
osm.on(Osm.events.SHOW_STREET_VIEW, cameraId => {
    console.log(cameraId);
});
osm.on(Osm.events.SELECT_PARKING_LOT, feature => {
    console.log(feature.get("metadata"));
});
osm.load("20f43f02-5bdf-4e51-b5bc-e34dad373bc8");