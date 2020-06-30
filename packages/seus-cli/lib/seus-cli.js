'use strict';

const CommandProcessorFactory = require('./command/commandProcessorFactory');

function seusCli(cli) {
  CommandProcessorFactory.createCommandProcessor(cli).process();
}

module.exports = seusCli;
