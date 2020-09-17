const CommandProcessor = require('./commandProcessor');
const {
  BUILDFTP,
  BUILDFCM,
  BUILDDLL,
} = require('../../scripts/build/buildType');
const builder = require('../../scripts/build');

class BuildCommandProcessor extends CommandProcessor {
  constructor(cli) {
    super(cli);
    this.buildType = this.params.buildType;
  }

  async process() {
    await builder(this.buildType);
    if (this.buildType === BUILDFTP)
      new (require('./ftpCommandProcessor'))(this.cli).process();
    else if (this.buildType === BUILDFCM)
      new (require('./fcmCommandProcessor'))(this.cli).process();
  }
}

module.exports = BuildCommandProcessor;
