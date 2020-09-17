const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  conf,
  cliCommand: { cmdPromise },
} = require('seus-utils');
const inquirer = require('inquirer');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');
const cwd = process.cwd();
const packageJSON = require('../../package.json');
const prepackage = require('./prepackage');
const appPackageJSON = {
  name: '',
  version: '1.0.0',
  private: true,
  scripts: {
    start: 'seus-scripts start',
    mock: 'seus-scripts mock',
    build: 'seus-scripts build',
    'build:dll': 'seus-scripts build:dll',
    'build:analy': 'seus-scripts build:analy',
    'build:ftp': 'seus-scripts build:ftp',
    'build:fcm': 'seus-scripts build:fcm',
    add: 'seus-scripts add',
    ftp: 'seus-scripts ftp',
    fcm: 'seus-scripts fcm',
  },
  dependencies: {},
  config: {
    seus: {
      frame: '',
    },
    commitizen: {
      path: './node_modules/cz-conventional-changelog',
    },
  },
  engines: {
    node: '>= 10.14.2',
  },
  browserslist: packageJSON.browserslist,
};

async function initConfig(filePath, yes = false, frame = '') {
  console.log(chalk.cyan('init config ...'));
  const publicBase = '/' + appPackageJSON.name;
  const answer = !yes
    ? await inquirer.prompt([
      {
        name: 'seperate',
        message: chalk.green('build file path seperate:'),
        default: conf.seperate,
      },
      {
        name: 'publicBase',
        message: chalk.green('build file deploy path:'),
        default: publicBase,
      },
      {
        name: 'entry',
        message: chalk.green('entry path:'),
        default: conf.entry,
      },
      {
        name: 'copyPath',
        message: chalk.green('common assets path:'),
        default: conf.copyPath,
      },
      ...(function() {
        if (frame) return [];
        return [
          {
            type: 'list',
            name: 'frame',
            message: chalk.green('use react or vue'),
            choices: [
              'react',
              'vue',
              new inquirer.Separator(
                chalk.reset('↑ ↓ to select. Control-C to cancel.')
              ),
            ],
          },
        ];
      })(),
    ])
    : {
      seperate: '/',
      publicBase,
      entry: conf.entry,
      copyPath: conf.copyPath,
      frame: 'react',
    };
  if (frame) answer.frame = frame;
  conf.seperate = answer.seperate;
  conf.publicBase = answer.publicBase;
  conf.entry = answer.entry;
  conf.copyPath = answer.copyPath;
  if (answer.frame === 'react') {
    conf.vendor = ['react', 'react-dom', '@babel/polyfill'];
    appPackageJSON['lint-staged'] = {
      '*.{js,jsx}': ['npm run eslint', 'git add'],
      '*.{ts,tsx}': ['npm run tslint', 'git add'],
      '*.{css,scss}': ['npm run stylelint', 'git add'],
    };
    (appPackageJSON['husky'] = {
      hooks: {
        'pre-commit': 'lint-staged',
        'commit-msg': 'validate-commit-msg',
      },
    }),
    (appPackageJSON.scripts.eslint = 'eslint . --ext .js,.jsx --fix');
    appPackageJSON.scripts.tslint = 'tslint src/**/*.{ts,tsx} --fix';
    appPackageJSON.scripts.stylelint = 'stylelint  src/**/*.{css,scss} --fix';
    appPackageJSON.scripts.lint =
      'npm run eslint && npm run tslint && npm run stylelint';
  } else {
    conf.vendor = ['vue', '@babel/polyfill'];
  }
  fs.writeFileSync(filePath, JSON.stringify(conf, null, 2) + os.EOL);
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

module.exports = async function(name, yes = false, scripts = '') {
  appPackageJSON.name = name;
  fs.mkdirSync(path.join(cwd, name));
  let frame =
    scripts && fs.existsSync(scripts)
      ? scripts.includes('vue')
        ? 'vue'
        : 'react'
      : '';
  const answer = await initConfig(
    path.posix.join(cwd, name + '/seus.config.json'),
    yes,
    frame
  );
  fs.mkdirSync(name + '/src');
  fs.mkdirSync(name + '/src/common');
  fs.mkdirSync(name + '/src/components');
  fs.copyFileSync(
    path.resolve(__dirname, 'template/src/common/rem.js'),
    name + '/src/common/rem.js'
  );
  fs.copyFileSync(
    path.resolve(__dirname, 'template/src/common/reset.css'),
    name + '/src/common/reset.css'
  );
  fs.copyFileSync(
    path.resolve(__dirname, 'template/gitignore'),
    name + '/.gitignore'
  );
  fs.copyFileSync(
    path.resolve(__dirname, 'template/README.md'),
    name + '/README.md'
  );
  fs.copyFileSync(
    require.resolve(
      answer.frame === 'react'
        ? 'seus-utils/babelrc-react'
        : 'seus-utils/babelrc-vue'
    ),
    name + '/.babelrc.js'
  );
  answer.frame === 'react' &&
    fs.copyFileSync(
      require.resolve('seus-utils/eslintrc-react'),
      name + '/.eslintrc.js'
    );
  fs.mkdirSync(name + `/src/${conf.entry || 'pages'}`);
  fs.mkdirSync(name + `/src/${conf.copyPath || 'lib'}`);
  appPackageJSON.config.seus.frame = answer.frame;
  fs.writeFileSync(
    path.posix.join(cwd, name + '/package.json'),
    JSON.stringify(appPackageJSON, null, 2) + os.EOL
  );
  const dependencies =
    answer.frame === 'react'
      ? [scripts || 'seus-package-react']
      : [scripts || 'seus-package-vue'];
  console.log(`Installing ${chalk.cyan(dependencies.join(' '))}`);
  await prepackage();
  let command, args;
  if (shouldUseYarn()) {
    command = 'yarn';
    args = ['add', '--exact'].concat(dependencies);
  } else {
    command = 'npm';
    args = [
      'i',
      '--save',
      '--save-exact',
      '--loglevel',
      'error',
      '--registry',
      'http://registry.npm.taobao.org',
    ].concat(dependencies);
  }
  args.push('--cwd');
  args.push(path.resolve(cwd, name));
  const child = spawn(command, args, { stdio: 'inherit' });
  child.on('close', async code => {
    if (code !== 0) {
      console.log(chalk.cyan(`${command} ${args.join(' ')}`));
      return;
    } else {
      await cmdPromise(path.resolve(cwd, name), 'npm run add app');
      cmdPromise(path.resolve(cwd, name), 'npm run build:dll');
    }
  });
};
