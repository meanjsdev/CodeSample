'use strict';

const authModel = require(`${appRoot}/models/auth`);

async function createAuthData(data) {
  return await authModel.create(data);
}

function deleteAuthData(condition) {
  return authModel.destroy(condition);
}

module.exports = {
  createAuthData,
  deleteAuthData
};
