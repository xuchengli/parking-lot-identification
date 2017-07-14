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
var $osmSection = $("#osm-section");
var $osmIframe = $("#osm-section iframe");
var $streetViewSection = $("#street-view-section");
var $streetViewIframe = $("#street-view-section iframe");
var $mappingSection = $("#mapping-section");
var parkingLotsMapping = new ParkingLotsMapping();

var i18n = new I18n();
i18n.init();

function showSection(name) {
    name == "home" ? $homeSection.show() : $homeSection.hide();
    name == "osm" ? $osmSection.show() : $osmSection.hide();
    name == "streetView" ? $streetViewSection.show() : $streetViewSection.hide();
    name == "mapping" ? $mappingSection.show() : $mappingSection.hide();
}
$.address.change(evt => {
    switch (evt.value) {
        case "/":
            showSection("home");
            break;
        case "/osm":
            $osmIframe.attr("src", "https://emap.crl.ibm.com/imd/workbench?app=parking-lots-editor&key=map");
            showSection("osm");
            break;
        case "/street-view":
            $streetViewIframe.attr("src", "https://emap.crl.ibm.com/imd/workbench?app=parking-lots-editor&key=car");
            showSection("streetView");
            break;
        case "/mapping":
            parkingLotsMapping.load("20f43f02-5bdf-4e51-b5bc-e34dad373bc8");
            showSection("mapping");
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
            $.address.value("/osm");
            break;
        case 1:
            $.address.value("/street-view");
            break;
        case 2:
            $.address.value("/mapping");
            break;
    }
});