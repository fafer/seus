const CommandProcessor = require('./commandProcessor');
const ftp = require('../../scripts/ftp');

class FtpCommandProcessor extends CommandProcessor {
  constructor(cli) {
    super(cli);
    this.index = this.cli.input[1];
    this.all = this.params.all;
  }

  async process() {
    ftp(this.index, this.all);
  }
}

module.exports = FtpCommandProcessor;
