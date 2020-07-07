const spawn = require('cross-spawn');
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

if(getPlatform() === PLATFORM.WINDOWS) {
  spawn('npm', [
    'i',
    '-g',
    '--registry=http://registry.npm.taobao.org',
    'mirror-config-china'
  ], { stdio: 'inherit' });
}
