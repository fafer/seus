#!/usr/bin/env node

const meow = require('meow');
const seusScriptsCli = require('./seus-scripts-cli');

const cli = meow(
  `
  Usage: seus-scripts <command> [options]

  Command: 
    seus-scripts start        启动项目
    seus-scripts mock         mock方式启动
    seus-scripts build        编译打包
    seus-scripts ftp          将打包生成的文件上传到测试环境
    seus-scripts fcm          将打包生成的文件上线
    seus-scripts build:dll    编译动态链接vendor资源
    seus-scripts build:analy  项目各模块依赖分析
    seus-scripts build:ftp    编译完成后上传测试
    seus-scripts build:fcm    编译完成后上线
    seus-scripts add <name>   添加页面入口或组件

  Help:
    seus-scripts --help
`,
  {
    description: false,
    flags: {
      yes: {
        type: 'boolean',
        alias: 'y',
      },
      all: {
        type: 'boolean',
        alias: 'a',
      },
      component: {
        type: 'string',
        alias: 'c',
      },
      title: {
        type: 'string',
        alias: 't',
      },
    },
  }
);
seusScriptsCli(cli);
