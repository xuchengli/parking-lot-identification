/**
 * Created by lixuc on 2017/6/1.
 */
var webpack = require("webpack");

module.exports = {
    entry: [
        "webpack-hot-middleware/client?reload=true",
        "./web/js/index.js"
    ],
    output: {
        filename: "bundle.js",
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
                loader: "url-loader",
                options: {
                    name: "[hash:6].[ext]",
                    limit: 10000
                }
            },
            {
                test: /\.pug$/,
                use: "pug-loader"
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({ jQuery: "jquery" })
    ]
};