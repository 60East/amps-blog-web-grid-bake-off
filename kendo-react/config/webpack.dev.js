const path = require('path');

const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: "./src/index.js",
    output: {
        path: helpers.root('dist'),
        publicPath: 'auto',
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$|\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
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

    resolve: {
        extensions: ['.js', '.jsx']
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })

    ],

    devServer: {
        historyApiFallback: true,
        static: './',
        hot: false,
        liveReload: false
    }
};
