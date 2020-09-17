const {
  START,
  MOCK,
  BUILD,
  BUILDFTP,
  BUILDFCM,
  BUILDDLL,
  BUILDBUNDLEANALY,
} = require('../../scripts/build/buildType');
const CommandProcessor = require('./commandProcessor');
class CommandProcessorFactory {
  static createCommandProcessor(cli) {
    let Processor;
    switch (cli.input[0]) {
      case 'init':
        Processor = require('./initCommandProcessor');
        break;
      case 'start':
        cli.flags.buildType = START;
        Processor = require('./buildCommandProcessor');
        break;
      case 'mock':
        cli.flags.buildType = MOCK;
        Processor = require('./buildCommandProcessor');
        break;
      case 'build':
        cli.flags.buildType = BUILD;
        Processor = require('./buildCommandProcessor');
        break;
      case 'ftp':
        Processor = require('./ftpCommandProcessor');
        break;
      case 'fcm':
        Processor = require('./fcmCommandProcessor');
        break;
      case 'build:ftp':
        cli.flags.buildType = BUILDFTP;
        Processor = require('./buildCommandProcessor');
        break;
      case 'build:fcm':
        cli.flags.buildType = BUILDFCM;
        Processor = require('./buildCommandProcessor');
        break;
      case 'add':
        Processor = require('./addCommandProcessor');
        break;
      case 'build:dll':
        cli.flags.buildType = BUILDDLL;
        Processor = require('./buildCommandProcessor');
        break;
      case 'build:analy':
        cli.flags.buildType = BUILDBUNDLEANALY;
        Processor = require('./buildCommandProcessor');
        break;
    }
    return Processor ? new Processor(cli) : new CommandProcessor(cli);
  }
}

module.exports = CommandProcessorFactory;
