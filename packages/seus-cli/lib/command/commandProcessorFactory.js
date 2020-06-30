const CommandProcessor = require('./commandProcessor');
class CommandProcessorFactory {
  static createCommandProcessor(cli) {
    let Processor;
    switch (cli.input[0]) {
      case 'init':
        Processor = require('./initCommandProcessor');
        break;
    }
    return Processor ? new Processor(cli):new CommandProcessor(cli);
  }
}

module.exports = CommandProcessorFactory;