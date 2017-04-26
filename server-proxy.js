const path = require('path');
const express = require('express');
const webpack = require('webpack');
const historyFallback = require('connect-history-api-fallback');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const proxyMiddleware = require('http-proxy-middleware');
const WebpackConfig = require('./webpack.config');

const port = process.env.PORT || 3000;
const apiProxy = {
  target: process.env.API_PROXY || 'http://results-manager.dev.onshape.com', // Must be in the onshape VPN network to access this page
  changeOrigin: true,
  logLevel: 'debug' // for less verbose output, try 'warn'
}

const app = express();
const compiler = webpack(WebpackConfig);

app.use(historyFallback()); // convert localhost:3000/url/path to localhost:3000/#/url/path if the request fails
app.use(webpackDevMiddleware(compiler, WebpackConfig.devServer));
app.use(webpackHotMiddleware(compiler));

app.use('/static', express.static('static')); // serve assets to the /static directory on the server

app.use(proxyMiddleware('/data', apiProxy)); // route all calls to /data to the remote backend

module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`);
});
