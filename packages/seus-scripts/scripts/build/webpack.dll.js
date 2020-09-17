const path = require('path');
const conf = require('../../conf');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    vendor: conf.VENDOR,
  },
  output: {
    path: conf.COPY_PATH,
    filename: '[name].js',
    library: '[name]_[hash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(conf.COPY_PATH, '[name]-manifest.json'),
      name: '[name]_[hash]',
    }),
  ],
};
