/* eslint-disable strict */

'use strict';

const nodeExternals = require('webpack-node-externals');
const pkg = require('./package.json');

module.exports = {
  entry: require.resolve('./src/index.js'),
  target: 'node',
  output: {
    path: 'minimal',
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    library: pkg.name
  },
  externals: [nodeExternals()],
  node: {
    global: false,
    process: false,
    Buffer: false,
    setImmediate: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  }
};
