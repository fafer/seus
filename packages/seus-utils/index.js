const conf = require('./seus.config');
const cliCommand = require('./cliCommand');
const path = require('path');
const cwd = process.cwd();
let {config:{seus:{frame}}} = require(path.resolve(cwd,'package.json'));
if(frame !== 'react' && frame !== 'vue') frame = 'react';
else frame = 'vue';

module.exports = { 
  conf,
  cliCommand,
  frame
}