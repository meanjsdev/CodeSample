'use strict';

const httpStatus = require('http-status');
const { constants } = require(`${appRoot}/config/constants`);
class ResponseBuilder {
  constructor() {}

  responseData(status, user, token = '') {
    const response = {};
    response.status = status;
    response.msg = this.message(status);
    if (token !== '') {
      response.userName = `${user.first_name} ${user.last_name}`;
      response.userId = user.user_id;
      response.token = token;
    }
    response.isLogin = status == httpStatus.OK ? true : false;
    return response;
  }

  message(status) {
    if (status == httpStatus.OK) {
      return constants.LOGIN_SUCCESS;
    } else if (status == httpStatus.BAD_REQUEST) {
      return constants.LOGIN_INCORRECT_PASSWORD;
    } else if (status == httpStatus.UNAUTHORIZED) {
      return constants.UNAUTHORIZED_MSG;
    } else {
      return constants.USER_NOT_FOUND;
    }
  }

  response(data) {
    const response = {};
    response.data = data;
    return response;
  }
}

module.exports = new ResponseBuilder();
