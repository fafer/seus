const spawn = require('cross-spawn');
const execSync = require('child_process').execSync;
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

module.exports = function() {
  return new Promise((resolve) => {
    if(getPlatform() === PLATFORM.WINDOWS) {
      try {
        const result = execSync('npm list mirror-config-china -g', { stdio: 'ignore' });
        if(!result.toString().includes('mirror-config-china')) {
          const child = spawn('npm', [
            'i',
            '-g',
            'mirror-config-china',
            '--registry',
            'http://registry.npm.taobao.org'
          ], { stdio: 'inherit' });
          child.on('close', () => {
            resolve();
          });
        }
      } catch (e) {
        resolve();
      }
    }
    resolve();
  })
}
