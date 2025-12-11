const Joi = require('joi');

const createApiKeySchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.required': 'API key name is required',
    'string.max': 'API key name must not exceed 100 characters',
  }),
});

const rotateApiKeySchema = Joi.object({
  name: Joi.string().optional().max(100),
});

module.exports = {
  createApiKeySchema,
  rotateApiKeySchema,
  validateCreateApiKey: (body) => createApiKeySchema.validate(body),
  validateRotateApiKey: (body) => rotateApiKeySchema.validate(body),
};
