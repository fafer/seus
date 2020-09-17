const spawn = require('cross-spawn');
const execSync = require('child_process').execSync;
const PLATFORM = {
  WINDOWS: 'WINDOWS',
  UNIX: 'UNIX',
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

function checkPkg(name, resolve) {
  try {
    const result = execSync(`npm list ${name} -g`, { stdio: 'ignore' });
    if (!result.toString().includes(name)) {
      installPkg(name, resolve);
    }
  } catch (e) {
    installPkg(name, resolve);
  }
}

function installPkg(name, resolve) {
  try {
    const child = spawn(
      'npm',
      ['i', '-g', name, '--registry', 'http://registry.npm.taobao.org'],
      { stdio: 'inherit' }
    );
    child.on('close', () => {
      resolve();
    });
  } catch (e) {
    resolve();
  }
}

module.exports = function() {
  return new Promise(resolve => {
    checkPkg('yarn', () => {
      if (getPlatform() === PLATFORM.WINDOWS) {
        checkPkg('mirror-config-china', resolve);
      } else {
        resolve();
      }
    });
  });
};
