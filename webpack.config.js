const nodeExternals = require('webpack-node-externals');
const pkg = require('./package.json');
const BabiliPlugin = require('babili-webpack-plugin');
const {join} = require('path');

module.exports = {
  entry: join(__dirname, 'src', 'index.js'),
  target: 'node',
  output: {
    path: join(__dirname, 'minimal'),
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
  },
  plugins: [new BabiliPlugin()]
};
