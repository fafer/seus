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
  'browserslist': packageJSON.browserslist
};

async function initConfig(filePath,yes=false) {
  console.log(chalk.cyan('init config ...'));
  const answer = !yes ? await inquirer.prompt([
    {
      name: 'seperate',
      message: chalk.green('build file path seperate:'),
      default:conf.seperate
    },
    {
      name: 'publicBase',
      message: chalk.green('build file deploy path:'),
      default:conf.publicBase
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
      default:1
    }
  ]):{seperate:'/',publicBase:'/'+appPackageJSON.name,entry:conf.entry,copyPath:conf.copyPath,frame:1};
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
  await cmdPromise(cwd, mkdirCmdString(name));
  await cmdPromise(cwd, cpCmdString(path.posix.join(__dirname, './template/'), name));
  await cmdPromise(cwd, cpCmdString(path.posix.join(__dirname, './.babelrc.js'), name+'/.babelrc.js'));
  await cmdPromise(cwd, mkdirCmdString(name+'/src/components'));
  await cmdPromise(cwd, mkdirCmdString(name+`/src/${conf.entry || 'pages'}`));
  await cmdPromise(cwd, mkdirCmdString(name+`/src/${conf.copyPath || 'lib'}`));
  appPackageJSON.name = name;
  fs.writeFileSync(path.posix.join(cwd,name+'/package.json'),JSON.stringify(appPackageJSON, null, 2) + os.EOL);
  const answer = await initConfig(path.posix.join(cwd,name+'/seus.config.json'),yes);
  const dependencies = answer.frame === 0 ? ['react@16.13.1','react-dom@16.13.1',scripts || 'seus-scripts']:['vue@2.6.10','vue-template-compiler@2.6.10','vue-router@3.0.3','vuex@3.1.0','vue-jsonp@0.1.8',scripts || 'seus-scripts'];
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
  child.on('close', code => {
    if (code !== 0) {
      console.log(chalk.cyan(`${command} ${args.join(' ')}`));
      return;
    } else {
      cmdPromise(path.resolve(cwd,name), 'npm run add app');
    }
  });
}