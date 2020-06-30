class CommandProcessor {

  constructor(cli) {
    this.cli = cli;
    this.cmd = cli.input[0] || '';
    this.params = cli.flags || {};
  }

  async process() { 
    this.cli.showHelp(0);
  }

}

module.exports = CommandProcessor;