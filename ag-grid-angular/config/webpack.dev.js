// Webpack 5 development configuration.
var helpers = require('./helpers');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    entry: {
        polyfills: './app/polyfills.ts',
        vendor: './app/vendor.ts',
        app: './app/boot.ts'
    },
    output: {
        path: helpers.root('dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: { minimize: false }
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                type: 'asset/resource',
                generator: { filename: '[path][name][ext]' }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'config/index.html' })
    ],
    devServer: {
        historyApiFallback: true,
        client: { logging: 'warn' }
    }
};
