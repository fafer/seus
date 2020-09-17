const table = require('text-table');
const servers = [];
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');

function getIndex(index) {
  index = new Number(index);
  if (isNaN(index)) index = 0;
  else {
    index = Number.parseInt(index);
    if (index >= servers.length || index < 0) {
      index = 0;
    }
  }
  return index;
}

module.exports = async function(index, all) {
  const { FTP, OUT_PATH, PUBLICBASE } = require('../../conf');
  FTP.forEach(({ host, port, user, password, srcPath, destPath }) => {
    let temp = { host, port, user, password };
    if (!srcPath) temp.srcPath = OUT_PATH;
    else temp.srcPath = srcPath;
    if (!destPath) temp.destPath = path.posix.join('/', PUBLICBASE);
    else temp.destPath = destPath;
    servers.push(temp);
  });
  if (!servers.length) {
    console.log(chalk.cyan('seus.config.json has not ftp config'));
    return;
  }
  const options = {
    index: getIndex(index),
    all,
  };
  if (options.all) {
    const choices = table(servers.map(d => Object.values(d))).split('\n');
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'host',
        message: 'FTP Server List',
        choices: [
          new inquirer.Separator(' '),
          ...choices.map((name, value) => {
            return { name, value, short: servers[value].host };
          }),
          new inquirer.Separator(' '),
          new inquirer.Separator(
            chalk.reset(
              '↑ ↓ to select. Enter to start upload. Control-C to cancel.'
            )
          ),
          new inquirer.Separator(' '),
        ],
      },
    ]);
    return servers[getIndex(answer.host)];
  }
  return servers[options.index];
};
