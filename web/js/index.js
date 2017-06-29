/**
 * Created by lixuc on 2017/6/1.
 */
import "uikit/dist/css/uikit.css";
import "ol/ol.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import Osm from "./osm";
import StreetViewList from "./street-view-list";
import StreetView from "./street-view";

UIkit.use(Icons);

var osm = new Osm();
osm.on(osm.events.SHOW_STREET_VIEW, feature => {
    var identification = feature.get("identification");
    if (identification) {
        var streetViewId = identification.street_view.id;
        var streetView = new StreetView();
        streetView.open(streetViewId);
    } else {
        var streetViewList = new StreetViewList();
        streetViewList.show(feature.getId());
    }
});
osm.on(osm.events.SELECT_PARKING_LOT, feature => {
    console.log(feature.get("metadata"));
});
osm.load("20f43f02-5bdf-4e51-b5bc-e34dad373bc8");