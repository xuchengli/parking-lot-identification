/**
 * Created by lixuc on 2017/6/1.
 */
import "uikit/dist/css/uikit.min.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";

UIkit.use(Icons);

//$("body").append("Parking Lot Identification!!");
UIkit.notification("Hello world.", {
    status: "primary"
});