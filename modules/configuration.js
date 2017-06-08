/**
 * Created by lixuc on 2017/6/5.
 */
module.exports = {
    EMap_API: process.env.EMap_API || "http://emap.crl.ibm.com/imd/api/",
    Street_View_APIKEY: process.env.Street_View_APIKEY || "car",
    mongodb: {
        //if need to auth, the URI of env is:
        //mongodb://admin:passw0rd@localhost:27017/parking_lots_identification?authMechanism=DEFAULT
        uri: process.env.MongoDB_URI || "mongodb://localhost:27017/parking_lots_identification"
    }
};