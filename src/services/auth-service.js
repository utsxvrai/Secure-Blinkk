const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/user-repository');
const organizationRepository = require('../repositories/organization-repository');
const User = require('../models/user');
const config = require('../config');
const { ConflictError, AuthenticationError } = require('../utils/errors');
const { logAction } = require('../utils/audit');

const register = async (email, password, firstName, lastName, organizationName) => {
  // Create new organization
  const organizationId = uuidv4();
  
  // Check if user with this email already exists globally
  // For MVP, we'll skip this check since each org is independent
  
  // Hash password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Create user
  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    organizationId,
    role: 'admin', // First user is admin
  });

  const createdUser = await userRepository.create(user);
  
  // Create organization
  try {
    await organizationRepository.create({
      id: organizationId,
      name: organizationName,
      owner: createdUser.id,
    });
  } catch (err) {
    console.error('Error creating organization:', err);
  }
  
  // Generate JWT
  const token = jwt.sign(
    {
      id: createdUser.id,
      email: createdUser.email,
      organizationId: createdUser.organizationId,
      role: createdUser.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );
  
  // Log audit
  await logAction(createdUser.id, organizationId, 'USER_REGISTERED', 'User', {
    email: createdUser.email,
  });

  return {
    token,
    user: new User(createdUser).getPublicData(),
  };
};

const login = async (email, password) => {
  // Find user
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new AuthenticationError('User account is inactive');
  }

  // Verify password
  const isPasswordValid = await bcryptjs.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );

  // Log audit
  await logAction(user.id, user.organizationId, 'USER_LOGIN', 'User', {
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
    },
  };
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

module.exports = {
  register,
  login,
  verifyToken,
};
