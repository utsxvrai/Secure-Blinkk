const authService = require('../services/auth-service');
const authValidator = require('../validators/auth-validator');
const { sendSuccess, sendError } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const register = async (req, res, next) => {
  try {
    const { error, value } = authValidator.validateRegister(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password, firstName, lastName, organizationName } = value;
    const result = await authService.register(email, password, firstName, lastName, organizationName);

    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = authValidator.validateLogin(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password } = value;
    const result = await authService.login(email, password);

    sendSuccess(res, result, 'Login successful', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
