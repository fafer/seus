const conf = require('../../conf');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const argv = require('yargs').argv;
const ssl = require('./https/createCertificate');

if (argv.mock) {
  process.env.MOCK_DATA = 'mock';
}
const CommonConfig = require('./webpack.common.js');

module.exports = Merge(CommonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    publicPath: conf.BASEPATH,
  },
  devServer: {
    host: '0.0.0.0',
    port: conf.PORT,
    open: true,
    openPage: '',
    public: 'localhost',
    useLocalIp: true,
    https: argv.https ? ssl() : false,
    disableHostCheck: true,
    allowedHosts: [],
    hot: true,
    contentBase: [conf.ENTRY_PATH],
    compress: true,
    publicPath: conf.BASEPATH,
    stats: 'errors-only',
    progress:true,
    watchOptions: {
      poll: true,
    },
    proxy: [
      {
        context: ['/**/*_v[0-9]*.js', '/**/*_v[0-9]*.css'],
        secure: false,
        target: `${argv.https ? 'https' : 'http'}://localhost`,
        changeOrigin: true,
        pathRewrite: function(path) {
          if (/\.js$/.test(path)) {
            return path.replace(/(_v\d*\.js)$/i, '.js');
          } else if (/\.css$/.test(path)) {
            return path.replace(/(_v\d*\.css)$/i, '.css');
          }
        },
      },
      ...conf.PROXY
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
