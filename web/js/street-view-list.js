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
                    var dialog = UIkit.modal(template({
                        views: data.views
                    }));
                    dialog.$el.on("click", "tbody button", e => {
                        var streetView = new StreetView();
                        streetView.on(StreetView.events.IDENTIFIED, (cameraId, streetViewId) => {
                            var osm = new Osm();
                            osm.highlightCamera(cameraId, streetViewId);
                        });
                        streetView.identify(cameraId, $(e.target).data("id"));
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