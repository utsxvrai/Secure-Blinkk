const Joi = require('joi');

const registrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
  organizationName: Joi.string().required().messages({
    'any.required': 'Organization name is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  password: Joi.string().min(8).optional(),
});

module.exports = {
  registrationSchema,
  loginSchema,
  updateProfileSchema,
  validateRegister: (body) => registrationSchema.validate(body),
  validateLogin: (body) => loginSchema.validate(body),
  validateUpdateProfile: (body) => updateProfileSchema.validate(body),
};

