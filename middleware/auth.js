'use strict';

const httpStatus = require('http-status');

const authHelper = require(`${appRoot}/helper/auth`);
const { constants } = require(`${appRoot}/config/constants`);

async function validateToken(req, res, next) {
  try {
    const legit = authHelper.decodeJWToken(req.headers.authorization);
    const authData = await authHelper.validateAuthUser(legit);
    if (authData.length > 0) {
      next();
    } else {
      const error = new Error();
      error.apiMessage = constants.UNAUTHORIZED_MSG;
      error.statusCode = httpStatus.UNAUTHORIZED;
      throw error;
    }
  } catch (e) {
    res
      .status(e.statusCode || httpStatus.UNAUTHORIZED)
      .send({ message: e.apiMessage || constants.UNAUTHORIZED_MSG });
  }
}

module.exports = {
  validateToken
};
