const { START, MOCK, BUILDDLL, BUILDBUNDLEANALY } = require('./buildType');

class Build {
  constructor(buildType) {
    this.buildType = buildType;
  }

  async buildEnv() {
    switch (this.buildType) {
      case MOCK:
        process.env.MOCK_DATA = 'mock';
      case START:
        process.env.NODE_ENV = 'development';
        this.buildDev();
        break;
      case BUILDDLL:
        process.env.NODE_ENV = 'production';
        this.buildProd('./webpack.dll.js');
        break;
      case BUILDBUNDLEANALY:
        process.env.BUNDLE_ANALY = 'bundle-analy';
      default:
        process.env.NODE_ENV = 'production';
        this.buildProd();
    }
  }

  buildDev() {
    const webpack = require('webpack');
    const devConf = require('./webpack.config.dev.js');
    const compiler = webpack(devConf);
    const server = new (require('webpack-dev-server'))(
      compiler,
      devConf.devServer
    );
    server.listen(devConf.devServer.port);
  }

  buildProd(config = './webpack.config.prod.js') {
    const webpack = require('webpack');
    const compiler = webpack(require(config));
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          console.log(err);
          reject(err);
          return;
        }
        console.log(
          stats.toString({
            progress: true,
            profile: true,
            colors: true,
          }) + '\n'
        );
        resolve();
      });
    });
  }

  async run() {
    return this.buildEnv();
  }
}

module.exports = async function(buildType = START) {
  const builder = new Build(buildType);
  await builder.run();
};
