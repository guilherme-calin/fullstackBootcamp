'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
//const { setup } = require('../../util');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: './main.js',
    output: {
        filename: 'bundle.js',
        publicPath: '../output/'
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 2,
        poll: 1
    },
    module: {
        rules: [
            { test: /\.html$/, use: 'html-loader' }
        ]
    }
};