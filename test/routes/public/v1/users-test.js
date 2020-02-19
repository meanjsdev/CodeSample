/* eslint-disable max-lines-per-function */
'use strict';

var chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../app');
const httpStatus = require('http-status');
chai.use(chaiHttp);
chai.should();

describe('Users', () => {
  /*
   * Test the /POST login with correct email and password route
   */
  describe('/POST api/v1/users/login', () => {
    it('it should not POST without email and password field', done => {
      const user = {
        email: 'test@ongraph.com',
        password: '1234567'
      };
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(httpStatus.OK);
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.should.have.property('msg');
          res.body.should.have.property('userName');
          res.body.should.have.property('userId');
          res.body.should.have.property('token');
          res.body.should.have.property('isLogin');
          done();
        });
    });
  });
  /*
   * Test the /POST login if password is incorrect
   */
  describe('/POST api/v1/users/login', () => {
    it('it should return 400 status', done => {
      const user = {
        email: 'test@ongraph.com',
        password: '1234567mmmm'
      };
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(httpStatus.BAD_REQUEST);
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.should.have.property('msg');
          res.body.should.have.property('isLogin');
          done();
        });
    });
  });
  /*
   * Test the /POST login if user not exist
   */
  describe('/POST api/v1/user/login', () => {
    it('it should return 404 status', done => {
      const user = {
        email: 'test@ongraph.commmm',
        password: '1234567'
      };
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(httpStatus.NOT_FOUND);
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.should.have.property('msg');
          res.body.should.have.property('isLogin');
          done();
        });
    });
  });
});
