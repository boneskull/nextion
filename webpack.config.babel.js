import nodeExternals from 'webpack-node-externals';
import pkg from './package.json';
import BabiliPlugin from 'babili-webpack-plugin';
import {join} from 'path';

export default {
  entry: join(__dirname, 'src', 'index.js'),
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
  },
  plugins: [
    new BabiliPlugin()
  ]
};
