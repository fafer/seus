const CommandProcessor = require('./commandProcessor');
const init = require('../../scripts/init');

class InitCommandProcessor extends CommandProcessor {

  constructor(cli) {
    super(cli);
    this.name = this.cli.input[1];
    this.yes = this.params.yes;
    this.scripts = this.params.scripts;
  }

  async process() {
    if (!this.name) {
      console.log(`
        Usage: seus init <name>

        Options:
          --yes, -y         defatult config
          --scripts, -s     assign seus-scripts package

        `
      );
    } else {
      init(this.name,this.yes,this.scripts);
    }
  }

}

module.exports = InitCommandProcessor;