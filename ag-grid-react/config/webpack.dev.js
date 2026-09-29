const path = require('path');

const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: "./src/index.js",
    output: {
        path: helpers.root('dist'),
        publicPath: '/',
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

    resolve: {
        alias: {
            "ag-grid-root" : "../node_modules/ag-grid"
        },
        extensions: ['.js', '.jsx']
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })

    ],

    devServer: {
        host: '127.0.0.1',
        port: 8080,
        historyApiFallback: true,
        static: {
            directory: helpers.root('.')
        },
        hot: 'only',
        liveReload: false
    }
};
