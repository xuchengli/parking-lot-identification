/**
 * Created by lixuc on 2017/7/12.
 */
import $ from "jquery";
import UIkit from "uikit";
import i18next from "i18next";
import jqueryI18next from "jquery-i18next";
import LngDetector from "i18next-browser-languagedetector";
import XHR from "i18next-xhr-backend";
import enPng from "../images/en.png";
import zhPng from "../images/zh-CN.png";
import template from "../templates/i18n-locale.pug";

let $localeList = $(".locale-list").on("click", "img", evt => {
    let $this = $(evt.target);
    let locale = $this.data("locale");
    let drop = UIkit.getComponent($this.parents(".uk-navbar-dropdown"), "drop");
    drop.hide(false);
    i18next.changeLanguage(locale);
});
let $locale = $(".locale");
let $title = $("title");
let $wrapperTitle = $(".wrapper-title");
let $loginBtn = $(".wrapper-button");
let $navTitle = $(".nav-title");
let $navOSM = $(".nav-open-street-map");
let $navSV = $(".nav-street-view");
let $navParkingLotsMapping = $(".nav-parking-lots-mapping");
let $parkingLotOSMEntry = $(".osm-entry");
let $parkingLotSVEntry = $(".street-view-entry");
let $parkingLotMappingEntry = $(".mapping-entry");
let $streetViewTitle = $(".street-view-title");
let $parkingLotOSMTitle = $(".parking-lot-osm-title");
let $parkingLotSVTitle = $(".parking-lot-street-view-title");
let $submitBtn = $("#submitBtn");

class i18n {
    constructor() {
        [enPng, zhPng].forEach((png, idx) => {
            $localeList.append(template({
                src: png,
                locale: idx == 0 ? "en" : "zh-CN"
            }));
        });
    }
    init() {
        i18next.use(LngDetector).use(XHR).init({
            debug: false,
            detection: {
                lookupCookie: "locale",
                caches: ["cookie"],
                cookieMinutes: 365*24*60
            },
            backend: {
                loadPath: (lng, ns) => {
                    if (lng != "en" && lng != "zh-CN") lng = "zh-CN";
                    return lng;
                },
                parse: data => data,
                ajax: (url, options, callback, data) => {
                    try {
                        let waitForLocale = require("bundle-loader!../locales/" + url + ".json");
                        waitForLocale(locale => {
                            callback(locale, {status: "200"});
                        })
                    } catch (e) {
                        callback(null, {status: "404"});
                    }
                }
            }
        }, (err, t) => {
            jqueryI18next.init(i18next, $);
            this.changeLocaleFlag(i18next.language);
            this.localize();
            i18next.on("languageChanged", lng => {
                this.changeLocaleFlag(lng);
                this.localize();
            });
        });
    }
    changeLocaleFlag(lng) {
        if (lng == "en") {
            $locale.attr("src", enPng);
        } else {
            $locale.attr("src", zhPng);
        }
    }
    localize() {
        $title.localize();
        $wrapperTitle.localize();
        $loginBtn.localize();
        $navTitle.localize();
        $navOSM.localize();
        $navSV.localize();
        $navParkingLotsMapping.localize();
        $parkingLotOSMEntry.localize();
        $parkingLotSVEntry.localize();
        $parkingLotMappingEntry.localize();
        $streetViewTitle.localize();
        $parkingLotOSMTitle.localize();
        $parkingLotSVTitle.localize();
        $submitBtn.localize();
    }
}
export default i18n;