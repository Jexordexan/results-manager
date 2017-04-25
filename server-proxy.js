'use strict';

const path = require('path')
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const proxyMiddleware = require('http-proxy-middleware')
const WebpackConfig = require('./webpack.config')

const useHMR = true;
const apiProxy = {
  target: 'http://results-manager.dev.onshape.com',
  changeOrigin: true,
  logLevel: 'debug' // for less verbose output, try 'info'
}

const port  = 3000;


const app = express()
const compiler = webpack(WebpackConfig)

app.use(webpackDevMiddleware(compiler, {
  stats: {
    colors: true,
    chunks: false
  }
}))

app.use(webpackHotMiddleware(compiler))

app.use('/static', express.static('static'))

app.use(proxyMiddleware('/data', apiProxy))

module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})

