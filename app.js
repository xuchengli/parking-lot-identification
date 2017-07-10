/**
 * Created by lixuc on 2017/6/1.
 */
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var i18n = require("i18n");
var config = require("./modules/configuration");

i18n.configure({
    locales: ["en", "zh_CN"],
    directory: path.join(__dirname, "locales")
});
var app = express();
var env = process.env.NODE_ENV || "production";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(i18n.init);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.env = env;
app.locals.context = config.Context_Path == "/" ? "" : config.Context_Path;

mongoose.connect(config.mongodb.uri);

if (env == "development") {
    var webpack = require("webpack");
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    var webpackDevConfig = require("./webpack.dev");
    var compiler = webpack(webpackDevConfig);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));

    require("./routes")(app, config.Context_Path);

    var reload = require("reload");
    var http = require("http");
    var server = http.createServer(app);
    reload(server, app);
    server.listen(8080, function() {
        console.log("Development server started>>>");
    });
} else {
    app.use(config.Context_Path, express.static(path.join(__dirname, "public")));
    require("./routes")(app, config.Context_Path);
    app.listen(8080, function() {
        console.log("Server started>>>");
    });
}