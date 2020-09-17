const CommandProcessor = require('./commandProcessor');
const deployFcm = require('../../scripts/fcm');

class FcmCommandProcessor extends CommandProcessor {
  constructor(cli) {
    super(cli);
    this.message = this.cli.input[1];
    this.yes = this.params.yes;
  }

  async process() {
    deployFcm(this.message, this.yes);
  }
}

module.exports = FcmCommandProcessor;
