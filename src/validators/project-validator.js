const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.required': 'Project name is required',
    'string.max': 'Project name must not exceed 100 characters',
  }),
  description: Joi.string().optional().max(500),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().optional().max(100),
  description: Joi.string().optional().max(500),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  validateCreateProject: (body) => createProjectSchema.validate(body),
  validateUpdateProject: (body) => updateProjectSchema.validate(body),
};
