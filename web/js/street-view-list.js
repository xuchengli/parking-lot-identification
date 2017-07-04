/**
 * Created by lixuc on 2017/6/6.
 */
import $ from "jquery";
import UIkit from "uikit";
import Osm from "./osm";
import StreetView from "./street-view";
import template from "../templates/street-view-list-modal.pug";

class streetViewList {
    show(cameraId) {
        $.ajax({
            type: "GET",
            url: "/api/street-views",
            dataType: "json",
            success: data => {
                if (data.success) {
                    var $unbindBtn = $(".unbind-button");
                    var $parkingLot_StreetView = $("#parkingLot_StreetView");
                    var dialog = UIkit.modal(template({
                        views: data.views
                    }));
                    dialog.$el.on("click", "tbody button", e => {
                        var streetView = new StreetView();
                        streetView.on(streetView.events.SELECT_PARKING_LOT, feature => {
                            if (feature) {
                                $parkingLot_StreetView.text(feature.getId()).trigger("contentChanged");
                            } else {
                                $parkingLot_StreetView.empty().trigger("contentChanged");
                            }
                        });
                        streetView.open($(e.target).data("id"), cameraId).then(result => {
                            var osm = new Osm();
                            osm.highlightCamera(result.camera, result.street_view);
                            $unbindBtn.data("streetViewId", result.street_view).show();
                        }).catch(err => {
                            UIkit.notification("<span uk-icon='icon: close'></span> " + err, "danger");
                        });
                        dialog.hide();
                    }).on("hidden", e => {
                        if (e.target === e.currentTarget) {
                            dialog.$destroy(true);
                        }
                    });
                    dialog.show();
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
export default streetViewList;