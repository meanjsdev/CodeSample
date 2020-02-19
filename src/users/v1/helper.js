/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable camelcase */
'use strict';

const AES = require('mysql-aes');
const userAuthHelper = require('./auth-helper');
const authHelper = require(`${appRoot}/helper/auth`);
const userModel = require(`${appRoot}/models/user`);
const projectModel = require(`${appRoot}/models/project`);
const projectMemberModel = require(`${appRoot}/models/project-member`);
const projectRoleTypeModel = require(`${appRoot}/models/project-role-type`);
const companyVendorModel = require(`${appRoot}/models/company-vendor`);
const vendorModel = require(`${appRoot}/models/vendor`);
const vendorRoleModel = require(`${appRoot}/models/vendor-role`);
const connection = require(`${appRoot}/config/dbconnection`).connectionInstance;

async function validateUser(email) {
  return await userModel.findOne({
    where: {
      email
    }
  });
}

function validatePassword(userPassword, password) {
  return AES.decrypt(password, 'key') === userPassword;
}

async function createUserJWT(user, rememberMe) {
  const authData = { user_id: user.user_id };
  const condition = { where: { user_id: user.user_id } };
  userAuthHelper.deleteAuthData(condition);
  const auth = await userAuthHelper.createAuthData(authData);
  const payload = { id: auth.id, userId: auth.user_id };
  const token = await authHelper.generateJWToken(payload, rememberMe);
  return token;
}

async function getAllProjectsByUserId(userId) {
  return projectModel.findAll({
    attributes: ['name', 'project_id', 'project_logo'],
    where: { project_state_type_id: 1 },
    include: [
      {
        model: projectMemberModel,
        attributes: [
          'project_id',
          'project_member_id',
          'user_id',
          'project_role_type_id'
        ],
        where: { user_id: userId, state: 'Active' },
        include: [
          {
            model: projectRoleTypeModel,
            attributes: ['name']
          }
        ],
        required: true
      }
    ],
    order: [['name', 'ASC']]
  });
}

async function getprojectByUserId(userId, projectId) {
  return projectModel.findAll({
    attributes: ['name', 'project_id', 'project_logo'],
    where: { project_state_type_id: 1, project_id: projectId },
    include: [
      {
        model: projectMemberModel,
        attributes: [
          'project_member_id',
          'user_id',
          'project_role_type_id'
        ],
        where: { user_id: userId, state: 'Active' },
        include: [
          {
            model: projectRoleTypeModel,
            attributes: ['name']
          }
        ],
        required: true
      }
    ],
    required: true
  });
}

async function getAllProjectMemberByProjectId(projectId) {
  return projectMemberModel.findAll({
    attributes: [
      'project_id',
      'project_member_id',
      'team_group_id',
      'project_role_type_id',
      'scope_bits',
      'entity_version',
      'state',
      'works_for_company_vendor_id',
      'enable_dashboard'
    ],
    where: {
      project_id: projectId,
      state: 'Active'
    },
    include: [
      {
        model: userModel,
        as: 'basepin_user',
        attributes: [
          'user_id',
          'first_name',
          'last_name',
          'job_title',
          'user_company_name',
          'email',
          'phone',
          'cell_phone'
        ],
        required: true
      },
      {
        model: companyVendorModel,
        attributes: ['company_vendor_id'],
        required: false,
        include: [
          {
            model: vendorModel,
            attributes: ['vendor_id'],
            required: false,
            include: [
              {
                model: vendorRoleModel,
                attributes: ['name'],
                required: false
              }
            ]
          }
        ]
      }
    ],
    order: [
      [userModel, 'last_name'],
      [userModel, 'first_name']
    ]
  });
}

async function getAllProjectOrganizational(projectId) {
  return connection
    .query(
      `SELECT distinct(vdr.company_name ) AS vendor_name, cv.company_vendor_id, pcv.company_vendor_id  AS  parent_company_vendor_id , vdr.company_name AS parent_vendor_name, vendor_role.name as vendor_role_name, project_member.enable_issue_create 
      FROM  project_member JOIN  company_vendor as cv ON project_member.works_for_company_vendor_id = cv.company_vendor_id 
      LEFT JOIN  project_organizational_link ON  project_organizational_link.company_vendor_id = cv.company_vendor_id AND  project_member.project_id = project_organizational_link.project_id 
      JOIN  vendor as vdr  ON  cv.vendor_id  = vdr.vendor_id LEFT JOIN vendor_role ON  vdr.vendor_role_id  =  vendor_role.vendor_role_id 
      LEFT JOIN company_vendor as pcv ON project_organizational_link.parent_company_vendor_id = pcv.company_vendor_id 
      LEFT JOIN vendor ON pcv.vendor_id = vdr.vendor_id 
      WHERE project_member.project_id = ${projectId} and project_member.state = "Active" 
      ORDER BY vdr.company_name`,
      { type: connection.QueryTypes.SELECT }
    )
    .then(function(users) {
      return users;
    });
}
async function getProjectIssues(req) {
  const projectId = req.params.projectId;
  const page = req.params.page;
  const rowCount = 5;
  let limitStart = 0;
  if(page != 1){
    limitStart = parseInt(page) * parseInt(rowCount);
  }
  const status = req.query.state;
  const issueTypeId = req.query.issue_type_id;

  let sqlQuery = `SELECT * FROM project_issue as pi 
    INNER JOIN project_issue_level as pil on pi.project_issue_id = pil.project_issue_id 
    WHERE pi.project_id = ${projectId}`;
  if(status != 'All'){
    if(status == '' || status == undefined){
      sqlQuery += ' AND pi.state = \'Open\'';
    }else{
      sqlQuery += ` AND pi.state = '${status}'`;
    }
  }
  if(issueTypeId > 0){
    sqlQuery += ` AND pi.issue_type_id = '${issueTypeId}'`;
  }
  sqlQuery += ` ORDER BY pi.project_issue_id DESC LIMIT ${limitStart}, ${rowCount}`;

  return connection.query(`${sqlQuery}`, { type: connection.QueryTypes.SELECT })
  .then(function(issues) {
    return issues;
  });
}

module.exports = {
  validateUser,
  validatePassword,
  createUserJWT,
  getAllProjectsByUserId,
  getAllProjectMemberByProjectId,
  getAllProjectOrganizational,
  getprojectByUserId,
  getProjectIssues
};
