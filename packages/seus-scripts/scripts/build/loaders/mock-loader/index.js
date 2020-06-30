var { getOptions } = require('loader-utils');
var validateOptions = require('schema-utils');

module.exports = function(source) {
  const options = getOptions(this) || {};
  validateOptions(require('./options.json'), options, 'Mock Loader');
  // Apply some transformations to the source...
  if (options.enable) {
    source = source.replace(/\/\/\s*@mock/g, '');
  }
  return source;
};
