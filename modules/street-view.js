/**
 * Created by lixuc on 2017/6/6.
 */
var rp = require("request-promise");
var config = require("./configuration");

class streetView {
    list() {
        return new Promise((resolve, reject) => {
            rp({
                uri: config.EMap_API + config.Street_View_APIKEY + "/maps",
                json: true
            }).then(response => {
                resolve(response);
            }).catch(err => {
                reject({ message: err.message || "System maintenance, please try again later!" });
            });
        });
    }
}
module.exports = streetView;