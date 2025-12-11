const apikeyService = require('../services/apikey-service');
const apikeyValidator = require('../validators/apikey-validator');
const { sendSuccess, sendError } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const createApiKey = async (req, res, next) => {
  try {
    const { error, value } = apikeyValidator.validateCreateApiKey(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { name } = value;
    const { organizationId } = req.user;

    const result = await apikeyService.createApiKey(name, organizationId);
    sendSuccess(res, result, 'API key created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getApiKeys = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const result = await apikeyService.getApiKeys(organizationId);
    sendSuccess(res, result, 'API keys retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const rotateApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.params;
    const { organizationId } = req.user;

    const result = await apikeyService.rotateApiKey(keyId, organizationId);
    sendSuccess(res, result, 'API key rotated successfully');
  } catch (err) {
    next(err);
  }
};

const revokeApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.params;
    const { organizationId } = req.user;

    const result = await apikeyService.revokeApiKey(keyId, organizationId);
    sendSuccess(res, result, 'API key revoked successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createApiKey,
  getApiKeys,
  rotateApiKey,
  revokeApiKey,
};
