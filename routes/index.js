/**
 * Created by lixuc on 2017/6/2.
 */
var path = require("path");

module.exports = function(app, contextPath) {
    app.use(contextPath, require("./dashboard"));
    app.use(path.join(contextPath, "api"), require("./api"));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });
};