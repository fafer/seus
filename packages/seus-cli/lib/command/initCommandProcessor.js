const CommandProcessor = require('./commandProcessor');
const init = require('../../scripts/init');
const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
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
    } else if (fs.existsSync(path.resolve(cwd,this.name))) {
      console.log(`${path.resolve(cwd,this.name)} already exists！`);
    } else {
      init(this.name,this.yes,this.scripts);
    }
  }

}

module.exports = InitCommandProcessor;