const CommandProcessor = require('./commandProcessor');
const init = require('../../scripts/init');

class InitCommandProcessor extends CommandProcessor {

  constructor(cli) {
    super(cli);
    this.name = this.cli.input[1];
    this.yes = this.params.yes;
  }

  async process() {
    if (!this.name) {
      console.log(`
        Usage: seus init <name>

        Options:
          --yes, -y         page title

        `
      );
    } else {
      init(this.name,this.yes);
    }
  }

}

module.exports = InitCommandProcessor;