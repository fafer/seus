const CommandProcessor = require('./commandProcessor');
const add = require('../../scripts/add');

class AddCommandProcessor extends CommandProcessor {
  constructor(cli) {
    super(cli);
    this.name = this.cli.input[1];
    this.component = this.params.component;
    this.title = this.params.title;
  }

  async process() {
    if (!this.name && !this.component) {
      console.log(`
      Usage: seus add <name>
    
      Options:
        --title, -t         page title
        --component, -c     component
    
      Examples:
        seus add test
        seus add test --title=test
        seus add test --component=test
    `);
    } else {
      add(this.name, { title: this.title, component: this.component });
    }
  }
}

module.exports = AddCommandProcessor;
