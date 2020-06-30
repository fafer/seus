const path = require('path');
const fs = require('fs');
const cwd = process.cwd();
const {conf} = require('seus-utils');
const confPath = path.resolve(cwd,'seus.config.json');
if(fs.existsSync(confPath)) {
  conf = Object.assign(conf,require(confPath));
}

const resolveExtensions = /\.js$/;

const getEntry = function(
  pathname,
  base = path.basename(pathname),
  entry = {}
) {
  let files = fs.readdirSync(pathname);

  let name = '';
  files.forEach(function(file) {
    if (fs.lstatSync(path.join(pathname, file)).isDirectory()) {
      getEntry(
        path.join(pathname, file),
        `${base}${ENTRY_SEPERATE}${file}`,
        entry
      );
    } else if (resolveExtensions.test(file)) {
      name = `${base}${ENTRY_SEPERATE}${file.replace(resolveExtensions, '')}`;
      entry[name] = path.join(pathname, file);
    }
  });
  return entry;
};

const SRC_PATH = path.join(cwd, 'src');

const OUT_PATH = path.join(cwd, 'dist');

const ENTRY_PATH = path.join(cwd, 'src/pages');

const PREFIX = conf.prefix || path.basename(ENTRY_PATH);

const ENTRY_SEPERATE = conf.seperate;

const CONFIG_COPY_PATH = conf.copyPath || '';
const COPY_PATH = path.join(cwd, 'src',CONFIG_COPY_PATH);

const COPY_DEST_PATH = path.join(OUT_PATH, CONFIG_COPY_PATH);

const PUBLICBASE = conf.publicBase;

const BASEPATH = PUBLICBASE ? PUBLICBASE + '/' : '/';

const HOST = conf.host;
const PUBLICPATH = HOST.js ? `//${HOST.js}${BASEPATH}` : BASEPATH;
const IMGPUBLICPATH = HOST.img ? `//${HOST.img}${BASEPATH}` : BASEPATH;
const CSSPUBLICPATH = HOST.css ? `//${HOST.css}${BASEPATH}` : BASEPATH;

const PORT = conf.port;
const PROXY = conf.proxy;
const ALIAS = conf.alias;
const FTP = conf.ftp;

module.exports = {
  SRC_PATH,
  OUT_PATH,
  ENTRY_PATH,
  COPY_PATH,
  COPY_DEST_PATH,
  getEntry() {
    return getEntry(ENTRY_PATH,PREFIX);
  },
  ENTRY_SEPERATE,
  HOST,
  PUBLICBASE,
  BASEPATH,
  PUBLICPATH,
  IMGPUBLICPATH,
  CSSPUBLICPATH,
  PORT,
  PROXY,
  ALIAS,
  FTP,
  CONFIG_COPY_PATH,
  PREFIX
};
