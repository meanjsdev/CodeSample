'use strict';

const expect = require('chai').expect;
const httpStatus = require('http-status');
const ResponseBuilder = require(`${appRoot}/src/users/v1/response-builder/response-builder`);

describe('test users login ResponseBuilder', () => {
  it('should return success login response', () => {
    const expected = {
      isLogin: true,
      msg: 'Login successfully!',
      status: httpStatus.OK
    };
    const actual = ResponseBuilder.responseData(httpStatus.OK);
    expect(expected).to.deep.equal(actual);
  });

  it('should return wrong credentials msg during login', () => {
    const expected = {
      isLogin: false,
      msg: 'Please enter correct password!',
      status: httpStatus.BAD_REQUEST
    };
    const actual = ResponseBuilder.responseData(httpStatus.BAD_REQUEST);
    expect(expected).to.deep.equal(actual);
  });

  it('should return user not exist during login', () => {
    const expected = {
      isLogin: false,
      msg: 'User Not Found!',
      status: httpStatus.NOT_FOUND
    };
    const actual = ResponseBuilder.responseData(httpStatus.NOT_FOUND);
    expect(expected).to.deep.equal(actual);
  });
});
