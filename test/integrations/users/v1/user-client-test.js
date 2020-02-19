/* eslint-disable camelcase */
/* eslint-disable max-lines-per-function */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
//const assert = chai.assert;
const httpStatus = require('http-status');
// eslint-disable-next-line no-unused-vars
const config = require('../../../../config/config');
const UserClient = require(`${appRoot}/src/users/v1/user-client`);
const responseBuilder = require(`${appRoot}/src/users/v1/response-builder/response-builder`);
const userHelper = require(`${appRoot}/src/users/v1/helper`);
const authHelper = require(`${appRoot}/helper/auth`);
const userAuthHelper = require(`${appRoot}/src/users/v1/auth-helper`);

const userClient = new UserClient(responseBuilder);

describe('Users', () => {
  //stub
  let getValidateUserStub = '';
  let getValidatePasswordStub = '';
  let getCreateUserJWTStub = '';
  let getGenerateJWTokenStub = '';
  let getAllProjectsByUserIdStub = '';
  let getprojectByUserIdStub = '';
  let getAllProjectMemberByProjectIdStub = '';
  let getAllProjectOrganizationalStub = '';
  let createChildOrgStub = '';
  //spy
  let statusSpy = '';
  let deleteAuthDataSpy = '';
  let createAuthDataDataSpy = '';
  let getmessageStub = '';
  let responseSpy = '';

  const userData = {
    user_id: 1237,
    first_name: 'test',
    last_name: 'test',
    password: '1234567'
  };
  const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA1LCJ1c2VySWQiOjEyMzcsImlhdCI6MTU3OTAwNzQ4OSwiZXhwIjoxNTc5MDA3Nzg5fQ.CqlarV4DRy9eVy8kVI5BLfexykWG_pIanWjy3ocT1tw';

  beforeEach(() => {
    //Login
    getValidateUserStub = sinon.stub(userHelper, 'validateUser');
    getValidatePasswordStub = sinon.stub(userHelper, 'validatePassword');
    getCreateUserJWTStub = sinon.stub(userHelper, 'createUserJWT');
    getGenerateJWTokenStub = sinon.stub(authHelper, 'generateJWToken');
    getmessageStub = sinon.stub(responseBuilder, 'message');
    createChildOrgStub = sinon.stub(userClient, 'createChildOrg');
    // responseStub = sinon.stub(responseBuilder, 'response');
    //Dashboard
    getAllProjectsByUserIdStub = sinon.stub(userHelper, 'getAllProjectsByUserId');
    getprojectByUserIdStub = sinon.stub(userHelper, 'getprojectByUserId');
    getAllProjectMemberByProjectIdStub = sinon.stub(userHelper, 'getAllProjectMemberByProjectId');
    getAllProjectOrganizationalStub = sinon.stub(userHelper, 'getAllProjectOrganizational');
    //spy
    deleteAuthDataSpy = sinon.spy(userAuthHelper, 'deleteAuthData');
    createAuthDataDataSpy = sinon.spy(userAuthHelper, 'createAuthData');
    statusSpy = sinon.spy(responseBuilder, 'responseData');
    responseSpy = sinon.spy(responseBuilder, 'response');
  });

  afterEach(() => {
    getValidateUserStub.restore();
    getValidatePasswordStub.restore();
    getCreateUserJWTStub.restore();
    getGenerateJWTokenStub.restore();
    getmessageStub.restore();
    getAllProjectsByUserIdStub.restore();
    getprojectByUserIdStub.restore();
    getAllProjectMemberByProjectIdStub.restore();
    getAllProjectOrganizationalStub.restore();
    createChildOrgStub.restore();
    //spy
    statusSpy.restore();
    deleteAuthDataSpy.restore();
    createAuthDataDataSpy.restore();
    responseSpy.restore();
  });

  describe('Login', () => {
    it('User not found', async () => {
      getValidateUserStub.resolves(null);
      getmessageStub.returns('User not found!');
      await userClient.usersLogin(null, null, 0);
      expect(httpStatus.NOT_FOUND).to.deep.equal(statusSpy.getCall(0).args[0]);
    });

    it('User password is not validate', async () => {
      getValidateUserStub.resolves(userData);
      getValidatePasswordStub.returns(false);
      getmessageStub.returns('Please enter correct password!');
      await userClient.usersLogin('test.test@ongraph.com', 'testing', 1);
      expect(httpStatus.BAD_REQUEST).to.deep.equal(statusSpy.getCall(0).args[0]);
    });

    it('User login successfully', async () => {
      getValidateUserStub.resolves(userData);
      getValidatePasswordStub.returns(true);
      getGenerateJWTokenStub.returns(userToken);
      getCreateUserJWTStub.returns(userToken);
      getmessageStub.returns('Login successfully!');
      await userClient.usersLogin('test.test@ongraph.com', '1234567', 1);
      expect(httpStatus.OK).to.deep.equal(statusSpy.getCall(0).args[0]);
      expect(userToken).to.deep.equal(statusSpy.getCall(0).args[2]);
    });
  });

  describe('Project Details', () => {
    describe('User able to access the project', () => {
      it('Logged in user don\'t have access to project and return empty array!', async () => {
        const projectData = [];
        getprojectByUserIdStub.resolves(projectData);
        const projectId = 95;
        await userClient.checkProjectAccess(projectId);
        expect(projectData).to.deep.equal(responseSpy.getCall(0).args[0]);
      });
      it('it should throw exception - in failure case', async () => {
        const userId = '11232131232';
        const error = { apiMessage: 'Something went wrong!', statusCode: 500 };
        try{
          getprojectByUserIdStub.throws(error);
          await userClient.checkProjectAccess(userId);
        }catch(err) {
          expect(error.apiMessage).to.deep.equal(err.apiMessage);
          expect(error.statusCode).to.deep.equal(err.statusCode);
        }
      });
      it('Show project data for valid user', async () => {
        const projectData = [{
          name:	'Atlanta Center',
          project_id:	94,
          project_logo:	'https://basepinconnect.com/images/projects/Atlanta%20Center/proj-icon1363306738979.png'
        }];
        getprojectByUserIdStub.resolves(projectData);
        const projectId = 94;
        await userClient.checkProjectAccess(projectId);
        expect(projectData).to.deep.equal(responseSpy.getCall(0).args[0]);
      });
    });

    describe('Project Team List', () => {
      it('No one member exist in the project!', async () => {
        const projectData = [];
        getAllProjectMemberByProjectIdStub.resolves(projectData);
        const projectId = 95;
        await userClient.projectDetails(projectId);
        expect(projectData).to.deep.equal(responseSpy.getCall(0).args[0]);
      });
      it('it should throw exception - in failure case', async () => {
        const userId = '11232131232';
        const error = { apiMessage: 'Something went wrong!', statusCode: 500 };
        try{
          getAllProjectMemberByProjectIdStub.throws(error);
          await userClient.projectDetails(userId);
        }catch(err) {
          expect(error.apiMessage).to.deep.equal(err.apiMessage);
          expect(error.statusCode).to.deep.equal(err.statusCode);
        }
      });
      it('Show all members in this project!', async () => {
        const projectData = [{
          project_id:	94,
          project_member_id: 1614,
          team_group_id: 3,
          project_role_type_id: 3
        }];
        getAllProjectMemberByProjectIdStub.resolves(projectData);
        const projectId = 94;
        await userClient.projectDetails(projectId);
        expect(projectData).to.deep.equal(responseSpy.getCall(0).args[0]);
      });
    });
    describe('Project Org Chart', () => {
      it('No data available for org chart!', async () => {
        const projectData = [];
        getAllProjectOrganizationalStub.resolves(projectData);
        const projectId = 95;
        await userClient.projectOrganizationalLinks(projectId);
        expect(projectData).to.deep.equal(responseSpy.getCall(0).args[0]);
      });
      it('it should throw exception - in failure case', async () => {
        const userId = '11232131232';
        const error = { apiMessage: 'Something went wrong!', statusCode: 500 };
        try{
          getAllProjectOrganizationalStub.throws(error);
          await userClient.projectOrganizationalLinks(userId);
        }catch(err) {
          expect(error.apiMessage).to.deep.equal(err.apiMessage);
          expect(error.statusCode).to.deep.equal(err.statusCode);
        }
      });
      it('Show all data to create Org chart!', async () => {
        const projectList = [ { vendor_name: 'Architectural Stylists',
            company_vendor_id: 229,
            parent_company_vendor_id: 238,
            parent_vendor_name: 'Architectural Stylists',
            vendor_role_name: 'Architect',
            enable_issue_create: 1
          },
          {
            vendor_name: 'Basepin',
            company_vendor_id: 238,
            parent_company_vendor_id: 238,
            parent_vendor_name: 'Basepin',
            vendor_role_name: 'Owner',
            enable_issue_create: 1
          }];
        getAllProjectOrganizationalStub.resolves(projectList);
        // const projectData = [{
        //   'name':'Basepin',
        //   'title':238,
        //   'childs':[{
        //     'title':229,
        //     'name':'Architectural Stylists'
        //     }]
        // }];
        const projectData = [ { name: 'Basepin', title: 238 } ];
        createChildOrgStub.returns(projectData);
        const projectId = 94;
        await userClient.projectOrganizationalLinks(projectId);
        expect(projectData).to.deep.equal(responseSpy.getCall(0).args[0]);
      });
    });
  });
});
