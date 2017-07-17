/**
 * Created by lixuc on 2017/7/17.
 */
import $ from "jquery";

const $navHeader = $(".nav-header");
const $navMenu = $(".nav-menu");
const $menu = $(".nav-menu li");

class navbar {
    transformTo(target) {
        if (target == "wrapper") {
            $navHeader.hide();
            $navMenu.hide();
        } else if (target == "home") {
            $navHeader.show();
            $navMenu.hide();
        } else {
            $navHeader.show();
            $navMenu.show();
        }
    }
    active(menu) {
        $menu.removeClass("uk-active");
        if (menu == "osm") {
            $($menu[0]).addClass("uk-active");
        } else if (menu == "streetView") {
            $($menu[1]).addClass("uk-active");
        } else {
            $($menu[2]).addClass("uk-active");
        }
    }
}
export default navbar;