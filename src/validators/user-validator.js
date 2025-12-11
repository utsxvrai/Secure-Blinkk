const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'manager', 'user').default('user'),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  role: Joi.string().valid('admin', 'manager', 'user').optional(),
  isActive: Joi.boolean().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  validateCreateUser: (body) => createUserSchema.validate(body),
  validateUpdateUser: (body) => updateUserSchema.validate(body),
  validateChangePassword: (body) => changePasswordSchema.validate(body),
};

