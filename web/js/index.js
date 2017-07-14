/**
 * Created by lixuc on 2017/6/1.
 */
import "uikit/dist/css/uikit.css";
import "ol/ol.css";
import "../css/style.css";
import $ from "jquery";
import "jquery-address";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import I18n from "./i18n";
import ParkingLotsMapping from "./parking-lots-mapping";

UIkit.use(Icons);

var $homeSection = $("#home-section");
var $mappingSection = $("#mapping-section");
var parkingLotsMapping = new ParkingLotsMapping();

var i18n = new I18n();
i18n.init();

$.address.change(evt => {
    switch (evt.value) {
        case "/":
            $homeSection.show();
            $mappingSection.hide();
            break;
        case "/dashboard":
            parkingLotsMapping.load("20f43f02-5bdf-4e51-b5bc-e34dad373bc8");
            $homeSection.hide();
            $mappingSection.show();
            break;
    }
});
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
}).on("click", evt => {
    var $this = $(evt.currentTarget);
    switch ($this.index(".entry-card")) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            $.address.value("/dashboard");
            break;
    }
});