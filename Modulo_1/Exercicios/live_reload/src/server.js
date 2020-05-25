'use strict';

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack-config');


const compiler = Webpack(webpackConfig);
const devServerOptions = Object.assign({}, {
    open: true,
    headers: {
        "Access-Control-Allow-Origin": "*"
    },
    contentBase: './',
    publicPath: '../output/',
    watchContentBase: true,
    inline: true,
    hot: true
});
console.log(`Diretório é ${__dirname}`);
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(9000, '127.0.0.1', () => {

});