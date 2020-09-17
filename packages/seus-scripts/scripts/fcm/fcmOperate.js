const { JSDOM } = require('jsdom');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const table = require('text-table');
const querystring = require('querystring');
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded; charset=UTF-8';
let isLogin = false,
  uploadedFiles = [],
  tms = [];
const accountPath = path.join(__dirname, 'account.json');
const instance = axios.create({
  timeout: 1000,
  baseURL: 'http://fcm.58corp.com/',
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
    Referer: 'http://fcm.58corp.com/index.php/user/login/',
    Origin: 'http://fcm.58corp.com',
    'X-Requested-With': 'XMLHttpRequest',
    Accept: '*/*',
    withCredentials: true,
  },
});

async function queryByRevision(rs_type, revision) {
  const response = await instance.post(
    '/Online/search',
    querystring.stringify({
      version: revision,
      searchType: 'operationList',
      rs_type,
      p: 1,
    })
  );
  let dom = new JSDOM(response.data),
    document = dom.window.document;
  let texts = Array.prototype.slice.call(
    document.querySelectorAll('.data-table .var-text')
  );
  let files = [],
    filePaths = [],
    filesTemp = Array.prototype.slice.call(texts[1].childNodes);
  filesTemp.forEach((d, i) => {
    if (i % 3 === 0) {
      files.push(
        d.nodeValue.replace(new RegExp(`${rs_type}\/(static|pic2).58.com`), '')
      );
      filePaths.push(d.nodeValue);
    }
  });
  return {
    rs_type,
    id: texts[0].getAttribute('data-id'),
    files,
    filePaths,
    revision,
    user: texts[4].firstChild.nodeValue,
  };
}

async function login() {
  if (isLogin) return isLogin;
  const url = '/index.php/user/login/';
  let response = await instance.get(url);
  let dom = new JSDOM(response.data),
    document = dom.window.document;
  let __hash__ = document.querySelector('input[name="__hash__"]').value;
  axios.defaults.headers.cookie = response.headers['set-cookie'];
  const account = await getAccount();
  response = await instance.post(
    url,
    querystring.stringify({
      ...account,
      retu: '',
      __hash__: __hash__,
    })
  );
  isLogin = response.data.status === 1;
  if (isLogin) {
    fs.writeFile(accountPath, JSON.stringify(account), err => {
      if (err) console.error(`write ${accountPath} failed`, err);
    });
  } else {
    console.log(chalk.cyan('email or password invalid'));
    delete axios.defaults.headers.cookie;
    if (fs.existsSync(accountPath)) {
      fs.unlinkSync(accountPath);
    }
    await login();
  }
  return isLogin;
}

async function getAccount() {
  if (!fs.existsSync(accountPath)) {
    console.log(chalk.cyan('please login to http://fcm.58corp.com'));
    const answer = await inquirer.prompt([
      {
        name: 'email',
        message: chalk.green('email:'),
      },
      {
        type: 'password',
        name: 'password',
        message: chalk.green('password:'),
      },
    ]);
    const account = {
      email: answer.email,
      password: answer.password,
    };
    return account;
  }
  return require('./account.json');
}

async function publish({ rs_type, id: modify_id, revision, files }) {
  await instance.post(
    '/Online/publish/',
    querystring.stringify({
      rs_type,
      modify_id,
      revision,
      ...() => {
        let result = {};
        files.forEach((d, i) => {
          result[`publish_file[${i}][file]`] = d;
          result[`publish_file[${i}][status]`] = 1;
          result[`publish_file[${i}][compress]`] = false;
          result[`publish_file[${i}][uglify_mangler]`] = false;
          result[`publish_file[${i}][compress_exlude_var]`] = '';
        });
        return result;
      },
    })
  );
  return files;
}

async function refreshVersion({ files }) {
  const result = [];
  for (let index = 0; index < files.length; index++) {
    const temp = await refreshTmsByFile(files[index]);
    if (temp) result.push(temp);
  }
  return result;
}

async function refreshTmsByFile(file) {
  const temp = await getTmsIdByFile(file);
  const id = temp ? temp.id : null;
  const version = await refreshTmsById(id);
  temp.version = version;
  return temp;
}

async function getTmsIdByFile(file) {
  if (/\.js$/.test(file)) file = `http://j1.58cdn.com.cn${file}`;
  else file = `http://c.58cdn.com.cn${file}`;
  let response = await instance.get(
    `/Online/getJcid/?url=${file}&_=${new Date().getTime()}`
  );
  if (response.data.status === 1) {
    return {
      id: response.data.data.jcid,
      file: file.replace('http:', ''),
      version: '',
    };
  }
  return null;
}

async function refreshTmsById(id) {
  if (!id) return '';
  const response = await instance.get(
    `/Online/updateResVersion/?jcid=${id}&_=${new Date().getTime()}`
  );
  if (response.data.status === 1) {
    return response.data.data.version;
  }
  return '';
}

async function push(rs_type, revisions, yes = false) {
  if (!revisions || !revisions.length) return;
  await login();
  if (!yes) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'yes',
        default: false,
        message: chalk.cyan('push to FCM？'),
      },
    ]);
    if (!answer.yes) return;
  }
  const spinner = ora(chalk.cyan('FCM uploading ...')).start();
  try {
    for (let index = 0; index < revisions.length; index++) {
      const info = await queryByRevision(rs_type, revisions[index]);
      if (!info.files.length) {
        spinner.succeed(chalk.green('No files to upload'));
        return;
      }
      await publish(info);
      uploadedFiles = uploadedFiles.concat(info.files);
      const tmsResult = await refreshVersion(info);
      tms = tms.concat(tmsResult);
    }
    spinner.succeed(chalk.green('uploaded files:'));
    showPushResult();
  } catch (e) {
    spinner.stop();
    console.log(e);
  }
}

function showPushResult() {
  if (uploadedFiles.length) {
    console.log(
      chalk.cyan(
        table([chalk.green('上线文件列表')].concat(uploadedFiles).map(d => [d]))
      )
    );
  }
  if (tms.length) {
    ora('').succeed(chalk.green('tms updated'));
    console.log(
      chalk.cyan(
        table(
          [
            {
              id: chalk.green('tms资源ID'),
              file: chalk.green('url'),
              version: chalk.green('version'),
            },
          ]
            .concat(tms)
            .map(d => Object.values(d)),
          {
            align: ['l', 'r', 'r'],
          }
        )
      )
    );
  }
}

module.exports = {
  push,
  refreshTmsById,
  refreshTmsByFile,
};
