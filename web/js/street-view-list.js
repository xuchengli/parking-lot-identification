/**
 * Created by lixuc on 2017/6/6.
 */
import $ from "jquery";
import UIkit from "uikit";
import template from "../templates/street-view-list-modal.pug";

var _osm, _streetView;
class streetViewList {
    constructor(osm, streetView) {
        _osm = osm;
        _streetView = streetView;
    }
    show(cameraId) {
        $.ajax({
            type: "GET",
            url: "api/street-views",
            dataType: "json",
            success: data => {
                if (data.success) {
                    var dialog = UIkit.modal(template({
                        views: data.views
                    }));
                    dialog.$el.on("click", "tbody button", e => {
                        _streetView.open($(e.target).data("id"), cameraId).then(result => {
                            _osm.highlightCamera(result.camera, result.street_view);
                            $(".unbind-button").data("streetViewId", result.street_view).show();
                        }).catch(err => {
                            UIkit.notification("<span uk-icon='icon: close'></span> " + err, "danger");
                        });
                        dialog.hide();
                    }).on("show", e=> {
                        $(".street-view-list-title").localize();
                        $(".street-view-item-name").localize();
                        $(".street-view-item-action").localize();
                        $("tbody button").localize();
                        $(".no-result").localize();
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