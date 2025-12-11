const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/user-repository');
const User = require('../models/user');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const { logAction } = require('../utils/audit');

const createUser = async (email, firstName, lastName, password, organizationId, role = 'user') => {
  // Check if user already exists
  const existingUser = await userRepository.findByEmail(email, organizationId);
  
  if (existingUser) {
    throw new ConflictError('User with this email already exists in the organization');
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Create user
  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    organizationId,
    role,
  });

  const createdUser = await userRepository.create(user);
  
  // Log audit
  await logAction(null, organizationId, 'USER_CREATED', 'User', {
    userId: createdUser.id,
    email: createdUser.email,
  });

  return {
    id: createdUser.id,
    email: createdUser.email,
    firstName: createdUser.firstName,
    lastName: createdUser.lastName,
    role: createdUser.role,
    organizationId: createdUser.organizationId,
  };
};

const updateUser = async (userId, organizationId, updates) => {
  // Verify user exists
  const user = await userRepository.findById(userId);
  
  if (!user || user.organizationId !== organizationId) {
    throw new NotFoundError('User not found');
  }

  // Update user
  const updatedUser = await userRepository.update(userId, updates);

  // Log audit
  await logAction(userId, organizationId, 'USER_UPDATED', 'User', {
    changes: updates,
  });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    role: updatedUser.role,
    organizationId: updatedUser.organizationId,
  };
};

const changePassword = async (userId, organizationId, currentPassword, newPassword) => {
  // Find user
  const user = await userRepository.findById(userId);
  
  if (!user || user.organizationId !== organizationId) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new ValidationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcryptjs.hash(newPassword, 10);

  // Update password
  await userRepository.update(userId, { password: hashedPassword });

  // Log audit
  await logAction(userId, organizationId, 'PASSWORD_CHANGED', 'User', {});

  return { message: 'Password changed successfully' };
};

const getOrganizationUsers = async (organizationId) => {
  const users = await userRepository.findByOrganization(organizationId);
  
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }));
};

const deactivateUser = async (userId, organizationId) => {
  // Find user
  const user = await userRepository.findById(userId);
  
  if (!user || user.organizationId !== organizationId) {
    throw new NotFoundError('User not found');
  }

  // Deactivate user
  await userRepository.update(userId, { isActive: false });

  // Log audit
  await logAction(userId, organizationId, 'USER_DEACTIVATED', 'User', {});

  return { message: 'User deactivated successfully' };
};

module.exports = {
  createUser,
  updateUser,
  changePassword,
  getOrganizationUsers,
  deactivateUser,
};
