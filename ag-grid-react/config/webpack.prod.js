// webpack.prod.js
var webpack = require('webpack');
var path = require('path');
var helpers = require('./helpers');

var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'source-map',

    entry: "./src/index.js",

    output: {
        path: helpers.root('dist'),
        publicPath: '/dist/',
        filename: '[name].js',
    },

    resolve: {
        alias: {
            "ag-grid-root" : "../node_modules/ag-grid"
        },
        extensions: ['.js', '.jsx']
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$|\.jsx$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-react', '@babel/preset-env']
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[path][name][ext]'
                }
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ]
};
