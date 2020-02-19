/* eslint-disable camelcase */
'use strict';

const httpStatus = require('http-status');
const authModel = require(`${appRoot}/models/auth`);
const jwtHelper = require('./jwt');
const jwtExpireTime = require(`${appRoot}/config/config`).jwtExpireTime;
const secret = require(`${appRoot}/config/config`).secret;
const { jwtErrors } = require(`${appRoot}/config/constants`);

function generateJWToken(payload, rememberMe) {
  let options = {};
  if (!rememberMe) {
    options = { expiresIn: `${jwtExpireTime}m` };
  }
  return jwtHelper.createToken(payload, secret, options);
}

function decodeJWToken(token) {
  try {
    return jwtHelper.decodeToken(token, secret);
  } catch (err) {
    const error = new Error();
    error.apiMessage = jwtErrors[err.name];
    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }
}

async function validateAuthUser(legit) {
  try {
    const condition = { where: { id: legit.id, user_id: legit.userId } };
    return authModel.findAll(condition);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  generateJWToken,
  decodeJWToken,
  validateAuthUser
};
