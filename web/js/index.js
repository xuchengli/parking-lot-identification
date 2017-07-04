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
var $unbindBtn = $(".unbind-button");
var $parkingLot_OSM = $("#parkingLot_OSM");
var $parkingLot_StreetView = $("#parkingLot_StreetView");
var $submitBtn = $("#submitBtn");
$submitBtn.attr("disabled", true);

$unbindBtn.on("click", evt => {
    var $this = $(evt.currentTarget);
    var streetView = new StreetView();
    streetView.close($this.data("streetViewId")).then(result => {
        var parkingLots = result.parking_lots;
        $unbindBtn.removeData("streetViewId").hide();
        osm.clearSelection();
        osm.normalizeCamera(result.camera);
        for (let parkingLot of parkingLots) {
            osm.normalizeParkingLot(parkingLot);
        }
    }).catch(err => {
        UIkit.notification("<span uk-icon='icon: close'></span> " + err, "danger");
    });
});
$parkingLot_OSM.on("contentChanged", evt => {
    var $this = $(evt.currentTarget);
    if ($this.text() == "") {
        $submitBtn.attr("disabled", true);
    } else if ($parkingLot_StreetView.text() != "") {
        $submitBtn.attr("disabled", false);
    }
});
$parkingLot_StreetView.on("contentChanged", evt => {
    var $this = $(evt.currentTarget);
    if ($this.text() == "") {
        $submitBtn.attr("disabled", true);
    } else if ($parkingLot_OSM.text() != "") {
        $submitBtn.attr("disabled", false);
    }
});
osm.on(osm.events.SHOW_STREET_VIEW, feature => {
    var identification = feature.get("identification");
    if (identification) {
        var streetView = new StreetView();
        streetView.on(streetView.events.SELECT_PARKING_LOT, feature => {
            if (feature) {
                $parkingLot_StreetView.text(feature.getId()).trigger("contentChanged");
            } else {
                $parkingLot_StreetView.empty().trigger("contentChanged");
            }
        });
        streetView.open(identification.street_view.id).then(result => {
            $unbindBtn.data("streetViewId", result.street_view).show();
        }).catch(err => {
            UIkit.notification("<span uk-icon='icon: close'></span> " + err, "danger");
        });
    } else {
        var streetViewList = new StreetViewList();
        streetViewList.show(feature.getId());
    }
});
osm.on(osm.events.SELECT_PARKING_LOT, feature => {
    if (feature) {
        $parkingLot_OSM.text(feature.getId()).trigger("contentChanged");
    } else {
        $parkingLot_OSM.empty().trigger("contentChanged");
    }
});
osm.load("20f43f02-5bdf-4e51-b5bc-e34dad373bc8");