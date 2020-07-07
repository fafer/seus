#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const cleanup = () => {
  console.log('Cleaning up.');
  cp.execSync('git checkout -- packages/*/package.json');
  cp.execSync('git clean -df packages/seus-package*/*.tgz');
};

const handleExit = () => {
  cleanup();
  process.exit();
};

const handleError = e => {
  console.error(e);
  cleanup();
  process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

module.exports = function (frame = 'react') {
  const rootDir = path.join(__dirname, '..');
  const packagesDir = path.join(rootDir, 'packages');
  const packagePathsByName = {};
  fs.readdirSync(packagesDir).forEach(name => {
    const packageDir = path.join(packagesDir, name);
    const packageJson = path.join(packageDir, 'package.json');
    if (fs.existsSync(packageJson)) {
      packagePathsByName[name] = packageDir;
    }
  });
  Object.keys(packagePathsByName).forEach(name => {
    const packageJson = path.join(packagePathsByName[name], 'package.json');
    const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    Object.keys(packagePathsByName).forEach(otherName => {
      if (json.dependencies && json.dependencies[otherName]) {
        json.dependencies[otherName] = 'file:' + packagePathsByName[otherName];
      }
      if (json.devDependencies && json.devDependencies[otherName]) {
        json.devDependencies[otherName] = 'file:' + packagePathsByName[otherName];
      }
      if (json.peerDependencies && json.peerDependencies[otherName]) {
        json.peerDependencies[otherName] =
          'file:' + packagePathsByName[otherName];
      }
      if (json.optionalDependencies && json.optionalDependencies[otherName]) {
        json.optionalDependencies[otherName] =
          'file:' + packagePathsByName[otherName];
      }
    });

    fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
  });

  const scriptsFileName = cp
    .execSync('npm pack', {
      cwd: path.join(packagesDir, 'seus-package-' + frame)
    })
    .toString()
    .trim();
  const scriptsPath = path.join(packagesDir, 'seus-package-' + frame, scriptsFileName);
  
  try {
    cp.execSync('yarn cache clean');
  } catch (e) {
    console.log('');
  }

  const args = process.argv.slice(2);

  const scriptPath = path.join(packagesDir, 'seus-cli', '/lib/index.js');
  cp.execSync(
    `node ${scriptPath} ${args.join(' ')} --scripts="${scriptsPath}"`, {
      cwd: rootDir,
      stdio: 'inherit',
    }
  );

  handleExit();
}