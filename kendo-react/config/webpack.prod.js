// webpack.prod.js
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

    plugins: [
        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ],

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxSize: 244000
        }
    }
};
