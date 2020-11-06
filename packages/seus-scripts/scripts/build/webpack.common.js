const path = require('path');
const conf = require('../../conf');
const fs = require('fs');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { frame } = require('seus-utils');
const babelrc =
  frame === 'react'
    ? require('seus-utils/babelrc-react')
    : require('seus-utils/babelrc-vue');
const cwd = process.cwd();

module.exports = {
  entry: conf.getEntry(),
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js?v=[contenthash:8]',
  },
  module: {
    rules: [
      ...(function() {
        let rules;
        if (frame === 'react') {
          rules = [
            {
              test: /\.jsx?$/,
              include: [cwd],
              exclude: /node_modules/,
              enforce: 'pre',
              loader: 'eslint-loader',
              options: {
                fix: true,
              },
            },
            {
              test: /\.tsx?$/,
              include: [cwd],
              exclude: /node_modules/,
              enforce: 'pre',
              loader: 'tslint-loader',
              options: {
                fix: true,
              },
            },
          ];
        } else {
          rules = [
            {
              test: /\.vue$/,
              loader: 'vue-loader',
            },
          ];
        }
        return rules;
      })(),
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          ...(function() {
            let temp1 = path.resolve(cwd, '.babelrc.js'),
              temp2 = path.resolve(cwd, '.babelrc.json'),
              temp3 = path.resolve(cwd, '.babelrc');
            if (
              fs.existsSync(temp1) ||
              fs.existsSync(temp2) ||
              fs.existsSync(temp3)
            ) {
              return ['babel-loader'];
            }
            return [
              {
                loader: 'babel-loader',
                options: babelrc,
              },
            ];
          })(),
          ...(() =>
            process.env.MOCK_DATA === 'mock'
              ? [{ loader: 'mock-loader', options: { enable: true } }]
              : [])(),
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: loader => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require('cssnano')(),
              ],
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name(filePath) {
                const temp = filePath
                  .replace(conf.SRC_PATH, '')
                  .substring(1)
                  .replace(/\\/g, '/')
                  .replace(/\//g, conf.ENTRY_SEPERATE)
                  .toLocaleLowerCase();
                return temp;
              },
              limit: 8192,
              publicPath:
                process.env.NODE_ENV === 'production'
                  ? conf.IMGPUBLICPATH
                  : conf.BASEPATH,
              emitFile: true,
            },
          },
          // {
          //   loader: 'img-loader',
          //   options: {
          //     plugins() {
          //       if (process.env.NODE_ENV === 'development') {
          //         return [];
          //       }
          //       return [
          //         require('imagemin-gifsicle')({
          //           interlaced: false,
          //         }),
          //         require('imagemin-mozjpeg')({
          //           progressive: true,
          //           arithmetic: false,
          //         }),
          //         require('imagemin-pngquant')({
          //           floyd: 0.5,
          //           speed: 2,
          //         }),
          //         require('imagemin-svgo')({
          //           plugins: [
          //             { removeTitle: true },
          //             { convertPathData: false },
          //           ],
          //         }),
          //       ];
          //     },
          //   },
          // },
        ],
      },
    ],
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  resolve: {
    extensions: [
      '.ts',
      '.js',
      '.json',
      ...(function() {
        if (frame === 'react') return ['.jsx', '.tsx'];
        return ['.vue'];
      })(),
      '.css',
      '.scss',
    ],
    alias: {
      ...(function() {
        if (frame === 'vue')
          return {
            vue$: 'vue/dist/vue.esm.js',
          };
        return {};
      })(),
      ...conf.ALIAS,
    },
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require(path.join(conf.COPY_PATH, 'vendor-manifest.json')),
    }),
    ...(function() {
      if (!conf.CONFIG_COPY_PATH || !fs.existsSync(conf.COPY_PATH)) return [];
      return [
        new CopyWebpackPlugin([
          {
            from: conf.COPY_PATH,
            to: conf.COPY_DEST_PATH,
          },
        ]),
      ];
    })(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css?v=[contenthash:8]',
    }),
    ...(function() {
      let VueLoaderPlugin,
        plugins = [];
      if (frame === 'vue') {
        VueLoaderPlugin = require('vue-loader/lib/plugin');
        plugins.push(new VueLoaderPlugin());
      }
      return plugins;
    })(),
  ],
};
