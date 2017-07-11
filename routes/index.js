/**
 * Created by lixuc on 2017/6/2.
 */
var path = require("path");

module.exports = function(app, contextPath) {
    app.use((req, res, next) => {
        if (!req.cookies["locale"]) {
            res.cookie("locale", req.getLocale(), { maxAge: 365*24*60*60*1000, httpOnly: true });
        }
        next();
    });
    app.use(contextPath, require("./dashboard"));
    app.use(path.join(contextPath, "api"), require("./api"));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });
};