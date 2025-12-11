const projectService = require('../services/project-service');
const projectValidator = require('../validators/project-validator');
const { sendSuccess, sendError } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const createProject = async (req, res, next) => {
  try {
    const { error, value } = projectValidator.validateCreateProject(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { name, description } = value;
    const { id: userId, organizationId } = req.user;

    const result = await projectService.createProject(name, description, organizationId, userId);
    sendSuccess(res, result, 'Project created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const result = await projectService.getProjects(organizationId);
    sendSuccess(res, result, 'Projects retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { organizationId } = req.user;

    const result = await projectService.getProjectById(projectId, organizationId);
    sendSuccess(res, result, 'Project retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { error, value } = projectValidator.validateUpdateProject(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { projectId } = req.params;
    const { id: userId, organizationId } = req.user;

    const result = await projectService.updateProject(projectId, organizationId, userId, value);
    sendSuccess(res, result, 'Project updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { id: userId, organizationId } = req.user;

    const result = await projectService.deleteProject(projectId, organizationId, userId);
    sendSuccess(res, result, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
