const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {conf,cliCommand:{cmdPromise,mkdirCmdString,cpCmdString}} = require('seus-utils');
const inquirer = require('inquirer');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');
const cwd = process.cwd();
const packageJSON = require('../../package.json');
const appPackageJSON = {
  'name':'',
  'version': '1.0.0',
  'private': true,
  "scripts": {
    "start": "seus-scripts start",
    "mock": "seus-scripts mock",
    "build": "seus-scripts build",
    "build:dll": "seus-scripts build:dll",
    "build:ftp": "seus-scripts build:ftp",
    "build:fcm": "seus-scripts build:fcm",
    "add": "seus-scripts add",
    "ftp": "seus-scripts ftp",
    "fcm": "seus-scripts fcm"
  },
  'dependencies':{},
  "config": {
    "seus": {
      "frame": ""
    }
  },
  'browserslist': packageJSON.browserslist
};

async function initConfig(filePath,yes=false) {
  console.log(chalk.cyan('init config ...'));
  const publicBase = '/'+appPackageJSON.name;
  const answer = !yes ? await inquirer.prompt([
    {
      name: 'seperate',
      message: chalk.green('build file path seperate:'),
      default:conf.seperate
    },
    {
      name: 'publicBase',
      message: chalk.green('build file deploy path:'),
      default:publicBase
    },
    {
      name: 'entry',
      message: chalk.green('entry path:'),
      default:conf.entry
    },
    {
      name: 'copyPath',
      message: chalk.green('common assets path:'),
      default:conf.copyPath
    },
    {
      name: 'frame',
      message: chalk.green('use react(0) or vue(1):'),
      default:0
    }
  ]):{seperate:'/',publicBase,entry:conf.entry,copyPath:conf.copyPath,frame:0};
  conf.seperate = answer.seperate;
  conf.publicBase = answer.publicBase;
  conf.entry = answer.entry;
  conf.copyPath = answer.copyPath;
  if(answer.frame === 0) conf.vendor = ['react', 'react-dom', '@babel/polyfill'];
  else conf.vendor = ['vue', '@babel/polyfill'];
  fs.writeFileSync(filePath,JSON.stringify(conf, null, 2) + os.EOL);
  return answer;
}

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = async function (name, yes = false,scripts='') {
  appPackageJSON.name = name;
  await cmdPromise(cwd, mkdirCmdString(name));
  const answer = await initConfig(path.posix.join(cwd,name+'/seus.config.json'),yes);
  await cmdPromise(cwd, cpCmdString(path.posix.join(__dirname, './template/'), name));
  await cmdPromise(cwd, cpCmdString(path.posix.join(__dirname, './.babelrc.js'), name+'/.babelrc.js'));
  await cmdPromise(cwd, mkdirCmdString(name+'/src/components'));
  await cmdPromise(cwd, mkdirCmdString(name+`/src/${conf.entry || 'pages'}`));
  await cmdPromise(cwd, mkdirCmdString(name+`/src/${conf.copyPath || 'lib'}`));
  appPackageJSON.config.seus.frame = answer.frame === 0 ? 'react' : 'vue';
  fs.writeFileSync(path.posix.join(cwd,name+'/package.json'),JSON.stringify(appPackageJSON, null, 2) + os.EOL);
  const dependencies = answer.frame === 0 ? [scripts || 'seus-package-react']:[scripts || 'seus-package-vue'];
  console.log(`Installing ${chalk.cyan(dependencies.join(' '))}`);
  let command,args;
  if(shouldUseYarn()) {
    command = 'yarn';
    args = [
      'add',
      '--exact'
    ].concat(dependencies);
  } else {
    command = 'npm';
    args = [
      'i',
      '--save',
      '--save-exact',
      '--loglevel',
      'error'
    ].concat(dependencies);
  }
  args.push('--cwd');
  args.push(path.resolve(cwd,name));
  const child = spawn(command, args, { stdio: 'inherit' });
  child.on('close', async code => {
    if (code !== 0) {
      console.log(chalk.cyan(`${command} ${args.join(' ')}`));
      return;
    } else {
      await cmdPromise(path.resolve(cwd,name), 'npm run add app');
      cmdPromise(path.resolve(cwd,name), 'npm run build:dll');
    }
  });
}