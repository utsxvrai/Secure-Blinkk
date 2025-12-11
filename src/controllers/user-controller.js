const userService = require('../services/user-service');
const userValidator = require('../validators/user-validator');
const { sendSuccess, sendError } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const createUser = async (req, res, next) => {
  try {
    const { error, value } = userValidator.validateCreateUser(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, firstName, lastName, password, role } = value;
    const { organizationId } = req.user;

    const result = await userService.createUser(email, firstName, lastName, password, organizationId, role);
    sendSuccess(res, result, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = userValidator.validateUpdateUser(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { userId } = req.params;
    const { organizationId } = req.user;

    const result = await userService.updateUser(userId, organizationId, value);
    sendSuccess(res, result, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { error, value } = userValidator.validateChangePassword(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { currentPassword, newPassword } = value;
    const { id: userId, organizationId } = req.user;

    const result = await userService.changePassword(userId, organizationId, currentPassword, newPassword);
    sendSuccess(res, result, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

const getOrganizationUsers = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const result = await userService.getOrganizationUsers(organizationId);
    sendSuccess(res, result, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { organizationId } = req.user;

    const result = await userService.deactivateUser(userId, organizationId);
    sendSuccess(res, result, 'User deactivated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  updateUser,
  changePassword,
  getOrganizationUsers,
  deactivateUser,
};
