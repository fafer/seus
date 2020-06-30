const {
  START,
  MOCK,
  BUILD,
  BUILDFTP,
  BUILDFCM
} = require('../../scripts/build/buildType');

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
    }
    return Processor ? new Processor(cli):new CommandProcessor(cli);
  }
}

module.exports = CommandProcessorFactory;