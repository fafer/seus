#!/usr/bin/env node

const meow = require('meow');
const seusCli = require('./seus-cli');

const cli = meow(
  `
  Usage: seus <command> [options]

  Command: 
    seus init <name>  初始化一个项目

  Help:
    seus --help
`,
  {
    description: false,
    flags: {
      yes: {
        type: 'boolean',
        alias: 'y',
      }
    }
  }
);
seusCli(cli);
