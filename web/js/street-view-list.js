/**
 * Created by lixuc on 2017/6/6.
 */
import $ from "jquery";
import UIkit from "uikit";
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
                    dialog.$el.on("click", "button", e => {
                        $.ajax({
                            type: "POST",
                            url: "/api/street-view/open",
                            data: {
                                camera: cameraId,
                                street_view: $(e.target).data("id")
                            },
                            dataType: "json",
                            success: data => {
                                if (data.success) {
                                    console.log(data);
                                    dialog.hide();
                                } else {
                                    UIkit.notification("<span uk-icon='icon: close'></span> " + data.message, "danger");
                                }
                            },
                            error: (XMLHttpRequest, textStatus, errorThrown) => {
                                UIkit.notification("<span uk-icon='icon: close'></span> " + errorThrown, "danger");
                            }
                        });
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