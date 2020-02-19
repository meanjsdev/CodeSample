/* eslint-disable max-lines-per-function */
'use strict';

const express = require('express');
const router = express.Router();
const cors = require('cors');

const httpStatus = require('http-status');
const userHelper = require(`${appRoot}/src/users/v1/helper`);
const { constants } = require(`${appRoot}/config/constants`);

router.use(cors());

class UserClient {
  constructor(responseBuilder, authHelper) {
    this.responseBuilder = responseBuilder;
  }

  async usersLogin(email, password, rememberMe) {
    const user = await userHelper.validateUser(email);
    if (!user) {
      return this.responseBuilder.responseData(httpStatus.NOT_FOUND);
    }
    const isValid = userHelper.validatePassword(password, user.password);
    if (!isValid) {
      return this.responseBuilder.responseData(httpStatus.BAD_REQUEST);
    }
    const token = await userHelper.createUserJWT(user, rememberMe);
    return this.responseBuilder.responseData(httpStatus.OK, user, token);
  }

  async userDashoard(userId) {
    try {
      const projectList = await userHelper.getAllProjectsByUserId(userId);
      return this.responseBuilder.response(projectList);
    } catch (err) {
      const error = new Error();
      error.apiMessage = constants.SequelizeDatabaseError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  async checkProjectAccess(userId, projectId) {
    try {
      const project = await userHelper.getprojectByUserId(userId, projectId);
      return this.responseBuilder.response(project);
    } catch (err) {
      const error = new Error();
      error.apiMessage = constants.SequelizeDatabaseError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  async projectDetails(projectId) {
    try {
      const projectDetails = await userHelper.getAllProjectMemberByProjectId(projectId);
      const projectList = this.getProjectList(projectDetails);
      return this.responseBuilder.response(projectList);
    } catch (err) {
      console.log(err);
      const error = new Error();
      error.apiMessage = constants.SequelizeDatabaseError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  async projectOrganizationalLinks(projectId) {
    try {
      const projectList = await userHelper.getAllProjectOrganizational(projectId);
      const organizational = [];
      const parents = [];
      projectList.filter(data => {
        if (
          data.company_vendor_id == data.parent_company_vendor_id ||
          data.parent_company_vendor_id == null
        ) {
          parents.push({
            name: data.vendor_name,
            title: data.company_vendor_id
          });
        } else {
          organizational.push(data);
        }
      });
      parents.forEach(data => {
        this.createChildOrg(data, organizational);
      });
      return this.responseBuilder.response(parents);
    } catch (err) {
      const error = new Error();
      error.apiMessage = constants.SequelizeDatabaseError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  createChildOrg(parent, projectList) {
    parent.childs = [];
    projectList.map(data => {
      if (data.parent_company_vendor_id == parent.title) {
        const child = {};
        child.title = data.company_vendor_id;
        child.name = data.vendor_name;
        parent.childs.push(child);
        this.createChildOrg(child, projectList);
      }
    });
    return parent;
  }

  getProjectList(projectDetails){
    const projectList = [];
    projectDetails.forEach(data => {
      const dataObject = {};
      dataObject.userId = data.basepin_user.user_id;
      dataObject.firstName = data.basepin_user.first_name;
      dataObject.lastName = data.basepin_user.last_name;
      dataObject.email = data.basepin_user.email;
      dataObject.phone = data.basepin_user.phone;
      dataObject.userCompanyName = data.basepin_user.user_company_name;
      dataObject.vendorRoleName = data.company_vendor.vendor.vendor_role.name;
      dataObject.jobTitle = data.basepin_user.job_title;
      dataObject.worksForCompanyVendorId = data.works_for_company_vendor_id;
      dataObject.companyVendorId = data.company_vendor.company_vendor_id;
      dataObject.state = data.company_vendor.state;
      projectList.push(dataObject);
    });
    return projectList;
  }
  async projectIssues(req){
    try {
      const issueList = await userHelper.getProjectIssues(req);
      return this.responseBuilder.response(issueList);
    } catch (err) {
      console.log(err);
      const error = new Error();
      error.apiMessage = constants.SequelizeDatabaseError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }
}

module.exports = UserClient;
