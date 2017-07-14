/**
 * Created by lixuc on 2017/6/1.
 */
import "uikit/dist/css/uikit.css";
import "ol/ol.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import I18n from "./i18n";
import Osm from "./osm";
import StreetViewList from "./street-view-list";
import StreetView from "./street-view";

UIkit.use(Icons);

var $entryCard = $(".entry-card");
$entryCard.hover(evt => {
    var $this = $(evt.currentTarget);
    $this.find(".uk-overlay-panel")
        .removeClass("uk-overlay-slide-bottom")
        .addClass("uk-overlay-slide-top uk-overlay-transition");
}, evt => {
    var $this = $(evt.currentTarget);
    $this.find(".uk-overlay-panel")
        .removeClass("uk-overlay-slide-top")
        .addClass("uk-overlay-slide-bottom");
});

var $unbindBtn = $(".unbind-button");
var $parkingLot_OSM = $("#parkingLot_OSM");
var $parkingLot_StreetView = $("#parkingLot_StreetView");
var $submitBtn = $("#submitBtn").attr("disabled", true);
var i18n = new I18n();
var osm = new Osm();
var streetView = new StreetView();

osm.on(osm.events.SHOW_STREET_VIEW, feature => {
    var identification = feature.get("identification");
    if (identification) {
        streetView.open(identification.street_view.id).then(result => {
            $unbindBtn.data("streetViewId", result.street_view).show();
        }).catch(err => {
            UIkit.notification("<span uk-icon='icon: close'></span> " + err, "danger");
        });
    } else {
        var streetViewList = new StreetViewList(osm, streetView);
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
streetView.on(streetView.events.SELECT_PARKING_LOT, feature => {
    if (feature) {
        $parkingLot_StreetView.text(feature.getId()).trigger("contentChanged");
    } else {
        $parkingLot_StreetView.empty().trigger("contentChanged");
    }
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

$unbindBtn.on("click", evt => {
    var $this = $(evt.currentTarget);
    streetView.close($this.data("streetViewId")).then(result => {
        $unbindBtn.removeData("streetViewId").hide();
        osm.clearSelection();
        osm.normalizeCamera(result.camera);
        var parkingLots = result.parking_lots;
        for (let parkingLot of parkingLots) {
            osm.normalizeParkingLot(parkingLot);
        }
    }).catch(err => {
        UIkit.notification("<span uk-icon='icon: close'></span> " + err, "danger");
    });
});
$submitBtn.on("click", evt => {
    var streetViewId = $unbindBtn.data("streetViewId");
    var parkingLot_Map = $parkingLot_OSM.text();
    var parkingLot_StreetView = $parkingLot_StreetView.text();
    $.ajax({
        type: "PUT",
        url: "api/street-view/" + streetViewId,
        data: {
            _map: parkingLot_Map,
            _street_view: parkingLot_StreetView
        },
        dataType: "json",
        success: data => {
            if (data.success) {
                var unbind_map = data.unbind.parking_lots_map;
                var unbind_streetView = data.unbind.parking_lots_street_view;
                var bind_map = data.bind.parking_lot_map;
                var bind_streetView = data.bind.parking_lot_street_view;

                osm.clearSelection();
                streetView.clearSelection();

                for (let unbindParkingLot of unbind_map) {
                    osm.normalizeParkingLot(unbindParkingLot);
                }
                for (let unbindParkingLot of unbind_streetView) {
                    streetView.normalizeParkingLot(unbindParkingLot);
                }
                osm.highlightParkingLot(bind_map.id, bind_map.properties);
                streetView.highlightParkingLot(bind_streetView.id, bind_streetView.properties);

                UIkit.notification("<span uk-icon='icon: check'></span> Success!", "success");
            } else {
                UIkit.notification("<span uk-icon='icon: close'></span> " + data.message, "danger");
            }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
            UIkit.notification("<span uk-icon='icon: close'></span> " + errorThrown, "danger");
        }
    });
});
i18n.init();
osm.load("20f43f02-5bdf-4e51-b5bc-e34dad373bc8");