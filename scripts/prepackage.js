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

if(getPlatform() === PLATFORM.WINDOWS) {
  try {
    const result = execSync('npm list mirror-config-china -g', { stdio: 'ignore' }).toString();
    if(!result.includes('mirror-config-china')) {
      spawn('npm', [
        'i',
        '-g',
        '--registry=http://registry.npm.taobao.org',
        'mirror-config-china'
      ], { stdio: 'inherit' });
    }
  } catch (e) {
    console.log(e);
  }
}
