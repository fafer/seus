const {START,MOCK, BUILDDLL} = require('./buildType');

class Build {
  constructor(buildType) {
    this.buildType = buildType;
  }

  async buildEnv() {
    if(this.buildType === START) {
      process.env.NODE_ENV = 'development';
      this.buildDev();
    } else if(this.buildType === MOCK) {
      process.env.NODE_ENV = 'development';
      process.env.MOCK_DATA = 'mock';
      this.buildDev();
    } else if(this.buildType === BUILDDLL) {
      process.env.NODE_ENV = 'production';
      return this.buildProd('./webpack.dll.js');
    } else {
      process.env.NODE_ENV = 'production';
      return this.buildProd();
    }
  }

  buildDev() {
    const webpack = require('webpack');
    const devConf = require('./webpack.config.dev.js');
    const compiler = webpack(devConf);
    const server = new (require('webpack-dev-server'))(compiler,devConf.devServer);
    server.listen(devConf.devServer.port);
  }

  buildProd(config='./webpack.config.prod.js') {
    const webpack = require('webpack');
    const compiler = webpack(require(config));
    return new Promise((resolve,reject) => {
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          console.log(err);
          reject(err);
          return;
        }
        console.log(stats.toString({
          progress:true,
          profile:true,
          colors:true
        }) + '\n');
        resolve();
      });
    });
  }

  async run() {
    return this.buildEnv();
  }
}

module.exports = async function(buildType=START) {
  const builder = new Build(buildType);
  await builder.run();
};