/**
 * Created by lixuc on 2017/6/2.
 */
module.exports = function(app) {
    app.use("/", require("./dashboard"));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });
};