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
                test: /\.(png|jpg|gif)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "images/"
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
        new webpack.NoEmitOnErrorsPlugin()
    ]
};