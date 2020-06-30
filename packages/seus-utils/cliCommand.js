const exec = require('child_process').exec;
const chalk = require('chalk');
const os = require('os');
const PLATFORM = {
  WINDOWS: 'WINDOWS',
  UNIX: 'UNIX'
};

function getPlatform() {
  switch (process.platform) {
    case 'win32':
    case 'win64':
      return PLATFORM.WINDOWS;
    default:
      return PLATFORM.UNIX;
  }
}

function getCdCommand() {
  switch (this.platform) {
    case PLATFORM.WINDOWS:
      return function cdToPath(folder) {
        return 'cd \"' + folder + '"';
      };
    case PLATFORM.UNIX:
      return function cdToPath(folder) {
        return 'cd \'' + folder + '\'';
      };
  }
}

function getCleanseCommand(setEnvVar) {
  switch (this.platform) {
    case PLATFORM.WINDOWS:
      return function (cmd) {
        let envCmd = setEnvVar();
        if (!envCmd.length)
          return cmd;
        return [envCmd, cmd].join(' ');
      };
    case PLATFORM.UNIX:
      return function (cmd) {
        return [setEnvVar('LC_ALL', 'en_US.UTF-8'), cmd].join(' ');
      };
  }
}

function getSetEnv() {
  switch (this.platform) {
    case PLATFORM.WINDOWS:
      return function (k, v) {
        if (!k)
          return '';
        return 'SET '.concat([k,v].join('='));
      };
    case PLATFORM.UNIX:
      return function (k, v) {
        if (!k)
          return '';
        return [k,v].join('=');
      };
  }
}

function getConcatenator() {
  switch(this.platform) {
    case PLATFORM.WINDOWS:
      return function (cmds) {
        return cmds.join(' && ');
      };
    case PLATFORM.UNIX:
      return function (cmds) {
        let cmdText = '';
        for (let i = 0; i < cmds.length; i++) {
          cmdText += cmds[i];
          if (i < cmds.length - 1)
            cmdText += ';';
        }
        return cmdText;
      };
  }
}

let cliCommand = (function getExecutor() {
  this.platform = getPlatform();

  let cdTo = getCdCommand.call(this);
  let concat = getConcatenator.call(this);
  let setEnvVar = getSetEnv.call(this);
  let cleanse = getCleanseCommand.call(this, setEnvVar);

  return function (folder, cmd) {
    let cmds = [];
    cmds.push(cdTo(folder));
    cmds.push(cleanse(cmd));

    return concat(cmds);
  }
})();

function mkdirCmdString(dirPath) {
  if (os.platform() != 'win32') {
    return `mkdir -p ${dirPath}`;
  }
  return `mkdir -p ${dirPath}`;
}

function cpCmdString(filePath, destPath) {
  if (os.platform() != 'win32') {
    return `cp -rf ${filePath} ${destPath}`;
  }
  return `cp -rf ${filePath} ${destPath}`;
}

module.exports = {
  mkdirCmdString,
  cpCmdString,
  cliCommand,
  cmdPromise(folder, cmd, spinner) {
    return new Promise((resolve, reject) => {
      exec(cliCommand(folder, cmd), function(err, stdout, stderr) {
        if (err) {
          spinner && spinner.stop();
          if (stderr) {
            process.stderr.write(stderr);
          }
          reject(new Error(err));
          return;
        }
        if (stdout && spinner) {
          spinner.succeed(chalk.green(stdout));
        } else if (spinner) {
          spinner.stop();
        } else {
          process.stdout.write(stdout);
        }
        resolve(stdout);
      });
    });
  }
};
