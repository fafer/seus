const path = require('path');
const conf = require('../../conf');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: conf.getEntry(),
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // {
      //   test: /\.js$/,
      //   include: [path.join(__dirname, '../src'), __dirname],
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   options: {
      //     fix: true
      //   }
      // },
      // {
      //   test: /\.ts$/,
      //   include: [path.join(__dirname, '../src'), __dirname],
      //   exclude: /node_modules/,
      //   enforce: 'pre',
      //   loader: 'tslint-loader',
      //   options: {
      //     fix: true,
      //   },
      // },
      {
        test: /\.(js|ts)$/,
        use: [
          ...(function() {
            let temp1 = path.resolve(process.cwd(),'.babelrc.js'),
                temp2 = path.resolve(process.cwd(),'.babelrc.json'),
                temp3 = path.resolve(process.cwd(),'.babelrc');
            if(fs.existsSync(temp1)|| fs.existsSync(temp2) || fs.existsSync(temp3)) {
              return ['babel-loader'];
            }
            return [{
              loader:'babel-loader',
              options:require('./.babelrc')
            }]
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
          // 'vue-style-loader',
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
    extensions: ['.ts', '.js', '.json', '.vue', '.css', '.scss'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      ...conf.ALIAS
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'initial',
          test: /node_modules\/(vue|@babel\/polyfill)\//,
          priority: 10,
        },
      },
    },
  },
  plugins: [
    ...(function() {
      if(!conf.CONFIG_COPY_PATH || !fs.existsSync(conf.COPY_PATH)) return [];
      return [new CopyWebpackPlugin([
        {
          from: conf.COPY_PATH,
          to: conf.COPY_DEST_PATH,
        },
      ])]
    })(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css',
    }),
    new VueLoaderPlugin(),
  ],
};
