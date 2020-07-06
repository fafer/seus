const conf = require('../../conf');
const path = require('path');
const fs = require('fs');
const {frame} = require('seus-utils');
let templateDir = path.join(__dirname, './template',frame);
let pageTemplateDir = path.join(templateDir, 'page');
let componentTemplateDir = path.join(templateDir, 'component');

let htmlTemplate = 'index.html';

let scriptTemplate = frame === 'react'?'index.jsx':'index.js';

let htmlTemplatePath = path.join(pageTemplateDir, htmlTemplate);

let scriptTemplatePath = path.join(pageTemplateDir, scriptTemplate);

let htmlStr;
let scriptStr;

function addComponent(name) {
  let componentPath = path.join(conf.SRC_PATH, `components/${name}`);
  if (!fs.existsSync(componentPath)) {
    fs.mkdirSync(componentPath);
    fs.copyFile(
      path.join(componentTemplateDir, 'index.scss'),
      path.join(componentPath, 'index.scss'),
      function() {}
    );
    if(frame === 'react') {
      let scriptStrTemp = fs.readFileSync(path.join(componentTemplateDir,'index.jsx')).toString();
      scriptStrTemp = scriptStrTemp
        .replace(
          /\$\{Component\}/gi,
          name.charAt(0).toUpperCase() + name.substring(1)
        );
      fs.writeFile(path.join(componentPath, 'index.jsx'), scriptStrTemp, err => {
        if (err) {
          console.error(`write ${path.join(componentPath, 'index.jsx')} failed`, err);
        }
      });
    } else {
      fs.copyFile(
        path.join(componentTemplateDir, 'index.vue'),
        path.join(componentPath, 'index.vue'),
        function() {}
      );
    }
    fs.copyFile(
      path.join(componentTemplateDir, 'mock.js'),
      path.join(componentPath, 'mock.js'),
      function() {}
    );
  }
}

function add(name, title = '') {
  let addPath = path.join(conf.ENTRY_PATH, name);

  let htmlTemp;
  let scriptTemp;
  if (fs.existsSync(addPath)) {
    console.warn(`${conf.ENTRY_PATH} directory has ${name}`);
    return;
  } else {
    fs.mkdirSync(addPath);
  }
  addComponent(name);
  if (!htmlStr) {
    htmlStr = fs.readFileSync(htmlTemplatePath).toString();
  }
  htmlTemp = htmlStr
    .replace(/\$\{base\}/gi, conf.PUBLICBASE)
    .replace(/\$\{lib\}/gi, conf.CONFIG_COPY_PATH)
    .replace(
      /\$\{name\}/gi,
      `${conf.PREFIX}${conf.ENTRY_SEPERATE}${name}${
        conf.ENTRY_SEPERATE
      }${path.basename(scriptTemplate, frame === 'react' ? '.jsx' : '.js')}`
    )
    .replace(/\$\{title\}/gi, title);
  fs.writeFile(path.join(addPath, htmlTemplate), htmlTemp, err => {
    if (err) {
      console.error(`write ${path.join(addPath, htmlTemplate)} failed`, err);
    }
  });
  if (!scriptStr) {
    scriptStr = fs.readFileSync(scriptTemplatePath).toString();
  }
  scriptTemp = scriptStr
    .replace(/\$\{Name\}/gi, name)
    .replace(
      /\$\{Component\}/gi,
      name.charAt(0).toUpperCase() + name.substring(1)
    );
  fs.writeFile(path.join(addPath, scriptTemplate), scriptTemp, err => {
    if (err) {
      console.error(`write ${path.join(addPath, scriptTemplate)} failed`, err);
    }
  });
}

module.exports = function(filename='',{title='',component=''}) {
  if(filename) add(filename || '', title || '');
  if(component && component !== filename) {
    addComponent(component);
  }
}
