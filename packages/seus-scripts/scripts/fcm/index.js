#!/usr/bin/env node

'use strict';

const {cliCommand:{cmdPromise,mkdirCmdString,cpCmdString}} = require('seus-utils');
const path = require('path');
const fs = require('fs');
const os = require('os');
const homeDir = os.homedir();
const fcmBaseDir = path.posix.join(homeDir, 'fcm');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { PUBLICBASE, OUT_PATH } = require('../../conf');
if (!PUBLICBASE || !/^\//.test(PUBLICBASE)) {
  process.exit(0);
}
const project = PUBLICBASE.split(path.sep)[1];
const projectPath = path.posix.join(fcmBaseDir, project);
const svnBase = 'svn://fcm.58corp.com/prod/';
const svn_pic = `${svnBase}${project}/pic2.58.com${PUBLICBASE}`;
const local_pic = path.posix.join(projectPath, 'pic2.58.com', PUBLICBASE);
const svn_static = `${svnBase}${project}/static.58.com${PUBLICBASE}`;
const local_static = path.posix.join(projectPath, 'static.58.com', PUBLICBASE);
const { push } = require('./fcmOperate');

if (!fs.existsSync(fcmBaseDir)) {
  fs.mkdirSync(fcmBaseDir);
}

async function checkout() {
  let checkoutPicCMD = `svn checkout ${svn_pic} ${local_pic}`,
    checkoutStaticCMD = `svn checkout ${svn_static} ${local_static}`;
  await cmdPromise(
    projectPath, checkoutPicCMD,
    ora(chalk.green(chalk.green(checkoutPicCMD))).start()
  );
  await cmdPromise(
    projectPath, checkoutStaticCMD,
    ora(chalk.green(chalk.green(checkoutStaticCMD))).start()
  );
}

async function update() {
  await cmdPromise(
    local_pic, 'svn update',
    ora(chalk.green(chalk.green(`${local_pic}:svn update ...`))).start()
  );
  await cmdPromise(
    local_static, 'svn update',
    ora(chalk.green(chalk.green(`${local_static}:svn update ...`))).start()
  );
}

function pull() {
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
    return checkout();
  }
  return update();
}

async function commit(message) {
  if (!message) {
    const answer = await inquirer.prompt([
      {
        name: 'message',
        message: chalk.green('svn commit -m fcm:'),
        validate: function(input) {
          var done = this.async();
          if (input.trim() === '') {
            done('You need to provide commit message');
            return;
          }
          done(null, true);
        },
      },
    ]);
    message = answer.message;
  }
  let picResult = await _commit(local_pic, message);
  let staticResult = await _commit(local_static, message);
  const revisions = [];
  if (picResult) {
    picResult = picResult.match(/Committed revision ([^\.]+)/);
    if (picResult) {
      revisions.push(picResult[1]);
    }
  }
  if (staticResult) {
    staticResult = staticResult.match(/Committed revision ([^\.]+)/);
    if (staticResult) {
      revisions.push(staticResult[1]);
    }
  }
  return revisions;
}

async function _commit(local, message) {
  const info = await status(local);
  if (!info) {
    return;
  }
  await add(local, info);
  return cmdPromise(
    local, `svn commit -m fcm:${message}`,
    ora(chalk.green(chalk.green(`${local}:svn commit ...`))).start()
  );
}

async function status(local) {
  const stdout = await cmdPromise(local, 'svn status');
  if (!stdout) {
    return null;
  }
  const lines = stdout.split('\n');
  const reslut = {
    needAdd: [],
    add: [],
    modify: [],
    del: [],
    needDel: [],
  };
  lines.forEach(d => {
    let temp = d.split(/\s{7}/g),
      type = temp[0],
      value = temp[1];
    switch (type) {
      case '?':
        reslut.needAdd.push(value);
        break;
      case 'A':
        reslut.add.push(value);
        break;
      case 'M':
        reslut.modify.push(value);
        break;
      case '!':
        reslut.needDel.push(value);
        break;
      case 'D':
        reslut.del.push(value);
        break;
    }
  });
  return reslut;
}

async function add(local, { needAdd, needDel }) {
  if (!needAdd.length && !needDel.length) {
    return;
  }
  for (let i = 0; i < needAdd.length; i++) {
    await cmdPromise(local, `svn add ${needAdd[i]}`);
  }
  for (let i = 0; i < needDel.length; i++) {
    await cmdPromise(local, `svn add ${needDel[i]}`);
  }
}

async function cp(src, base = '') {
  if (!fs.lstatSync(src).isDirectory()) {
    return true;
  }
  let files = fs.readdirSync(src);
  for (let index = 0; index < files.length; index++) {
    let file = files[index];
    let filePath = path.posix.join(src, file);
    let destPath = base ? `${base}/${file}` : file;
    if (fs.lstatSync(filePath).isDirectory()) {
      await cp(filePath, destPath);
    } else if (/\.(png|svg|jpg|jpeg|gif)$/.test(filePath)) {
      if (base) {
        await cmdPromise(local_pic, mkdirCmdString(base));
      }
      await cmdPromise(local_pic, cpCmdString(filePath, destPath));
    } else {
      if (base) {
        await cmdPromise(local_static, mkdirCmdString(base));
      }
      await cmdPromise(
        local_static, cpCmdString(filePath, destPath)
      );
    }
  }
}

async function deployFcm({ message, yes }) {
  await pull();
  await cp(OUT_PATH);
  const revisions = await commit(message);
  await push(project, revisions, yes);
}

module.exports = function(message,yes) {
  deployFcm({message,yes})
}
