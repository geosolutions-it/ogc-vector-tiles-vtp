const webpack = require('webpack');
const path = require('path');
const DefinePlugin = require("webpack/lib/DefinePlugin");
const env = require('./env');

module.exports = {
    devtool: 'eval',
    context: path.join(__dirname, 'src'),
    target: 'web',
    entry: {
        'webpack-dev-server': 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr&timeout=20000',
        'wmtsDemo': './wmts/client.js',
        'wfsDemo': './wfs/client.js',
        'datasets': './datasets/client.js',
        'wmtsext': './wmtsext/client.js'
    },
    output: {
        path: path.join(__dirname, 'www'),
        filename: '[name].js',
        publicPath: 'http://localhost:3000/assets/'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new DefinePlugin({
            'process.env': env.dev
        })
    ],
    module: {
        noParse: [/tangram\/dist\/tangram/, /tangram\\dist\\tangram/],
        loaders: [{
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: [/mode_modules/],
            include: [/@mapbox/]
        },
        {
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader'
            }]
        },
        {
            test: /\.(gif|svg|jpg|png)$/,
            loader: "file-loader",
        }]
    }
};
