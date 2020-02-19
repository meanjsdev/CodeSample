'use strict';

const path = require('path');

const { constants } = require('../src/config/constants');

function overrideConsoleMethods() {
  /* eslint-disable no-console */
  console.error = function() {};
  console.warn = function() {};
  console.info = function() {};
  console.debug = function() {};
  /* eslint-enable no-console */
}

function setEnvironmentals() {
  process.env.NODE_APP_PORT = 5050;
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = constants.DEFAULT_DB_PORT;
  process.env.DB_USER = 'root';
  process.env.DB_PASS = 'root';
  process.env.DB_NAME = 'pipelines';
}

function getAppRoot() {
  return path.normalize(`${path.resolve(__dirname)}'/../src`);
}

function setGlobalPaths(appRoot) {
  global.appRoot = appRoot;
  global.modulesPath = `${appRoot}`;
  global.modelsPath = `${appRoot}/src/models`;
  global.test = `${appRoot}/test`;
}

function prepareForTests() {
  const appRoot = getAppRoot();
  setEnvironmentals();
  setGlobalPaths(appRoot);
  overrideConsoleMethods();
}

prepareForTests();
