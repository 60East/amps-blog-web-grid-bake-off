var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');


module.exports = {
    target: 'web',
    entry: {
        bundle: ['./node_modules/webix/webix.js', './src/main.ts'],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/bundle.js'
    },
    node: { Buffer: false },
    devtool: 'source-map',
    devServer: {
        publicPath: '/',
        contentBase: 'dist',
        compress: true,
        port: 8000
    },
    module: {
        rules: [
            // Linting before building
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    configFile: 'tslint.json',
                    tsConfigFile: 'tsconfig.json',
                    failOnHint: true,
                    typeCheck: true
                }
            },
            // Converting TS -> JS and bundling into a single file
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({include: /\.js$/, minimize: true, sourceMap: true}),
        new CopyWebpackPlugin([
            {from: './node_modules/webix/webix.css', to: 'css'},
            {from: './assets/css', to: 'css'},
            {from: './assets/img', to: 'img'},
            {from: './assets/js', to: 'js'},
            {from: './src/query_worker.js', to: 'js'},
            {from: './node_modules/amps/amps.js', to: 'js'},
            {from: './node_modules/webix/fonts/', to: 'css/fonts'}
        ])
    ]
};
