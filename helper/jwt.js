'use strict';

const jwtoken = require('jsonwebtoken');

function createToken(payload, secret, options) {
  return jwtoken.sign(payload, secret, options);
}

function decodeToken(token, secret) {
  return jwtoken.verify(token, secret);
}

module.exports = {
  createToken,
  decodeToken
};
