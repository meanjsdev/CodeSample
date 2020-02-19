'use strict';

const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const UserClient = require(`${appRoot}/src/users/v1/user-client`);
const responseBuilder = require(`${appRoot}/src/users/v1/response-builder/response-builder`);

const userClient = new UserClient(responseBuilder);

router.post('/users/login', async function login(req, res) {
  userClient
    .usersLogin(req.body.email, req.body.password, req.body.rememberMe)
    .then(result => {
      return res.status(result.status).json(result);
    })
    .catch(err => {
      return res
        .status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          msg: err.message || 'server error'
        });
    });
});

module.exports = router;
