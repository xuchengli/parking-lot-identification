/**
 * Created by lixuc on 2017/6/2.
 */
var rp = require("request-promise");
var config = require("./configuration");

class map {
    constructor(id) {
        this.id = id;
    }
    getAllFeatures() {
        return new Promise((resolve, reject) => {
            rp({
                uri: config.EMap_API + this.id + "/layers/features",
                json: true
            }).then(response => {
                resolve(response);
            }).catch(err => {
                reject({ message: err.message || "System maintenance, please try again later!" });
            });
        });
    }
}
module.exports = map;