const path = require('path');
const conf = require('../../conf');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtraHtmlWebpackPlugin = require('./plugins/extra-html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const argv = require('yargs').argv;

function htmlPlugin() {
  let plugins;
  if (argv.html) {
    plugins = Object.keys(CommonConfig.entry).map(d => {
      d = d.replace(new RegExp(conf.ENTRY_SEPERATE, 'g'), '/');
      return new HtmlWebpackPlugin({
        filename: `${d}.html`,
        template: path.join(conf.ENTRY_PATH, `../${d}.html`),
        minify: false,
        inject: false,
        chunks: [d],
      });
    });
    plugins.push(new ExtraHtmlWebpackPlugin());
  } else {
    plugins = [];
  }
  return plugins;
}

module.exports = Merge(CommonConfig, {
  mode: 'production',
  output: {
    publicPath: conf.PUBLICPATH,
    path: conf.OUT_PATH,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: false,
        extractComments: false,
        terserOptions:{
          compress:{
            drop_console: true
          },
          output: {
            comments: false
          },
          warnings: false,
        }
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [conf.OUT_PATH],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    ...htmlPlugin(),
    new ManifestPlugin({
      basePath: conf.BASEPATH,
      generate(seed, files) {
        return files.reduce((manifest, { name, path, isChunk, chunk }) => {
          if (isChunk) {
            path = path.replace(
              /(\.(js|css))$/g,
              $0 => '_' + chunk.hash.substring(0, 20) + $0
            );
          }
          if (/\.js$/.test(path)) {
            return { ...manifest, [name]: path };
          } else if (/\.css$/.test(path)) {
            return {
              ...manifest,
              [name]: path.replace(conf.PUBLICPATH, conf.CSSPUBLICPATH),
            };
          } else if (/\.html$/.test(path)) {
            return manifest;
          }
          return {
            ...manifest,
            [conf.BASEPATH + path.replace(conf.PUBLICPATH, '')]: path.replace(
              conf.PUBLICPATH,
              conf.IMGPUBLICPATH
            ),
          };
        }, seed);
      },
    }),
  ],
});
