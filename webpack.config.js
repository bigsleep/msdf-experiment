// const MinifyPlugin = require("babel-minify-webpack-plugin");

const webpack = require('webpack');

module.exports = {
    entry: __dirname + '/src/app.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
    },
    plugins: [
        new webpack.ProvidePlugin({
            'THREE': 'three'
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['env', 'react']
                }
            }
        ]
    },
    resolve: {
        alias: {
		    'three/OrbitControls': __dirname + '/node_modules/three/examples/js/controls/OrbitControls.js'
        }
    }
};
