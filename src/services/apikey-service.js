const apikeyRepository = require('../repositories/apikey-repository');
const ApiKey = require('../models/ApiKey');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { logAction } = require('../utils/audit');

const createApiKey = async (name, organizationId) => {
  // Generate key
  const key = ApiKey.generateKey();
  const keyHash = ApiKey.generateKeyHash(key);
  const keyPrefix = ApiKey.getKeyPrefix(key);

  // Create API key record
  const apiKey = new ApiKey({
    organizationId,
    name,
    keyHash,
    keyPrefix,
  });

  const createdApiKey = await apikeyRepository.create(apiKey);

  // Log audit
  await logAction(null, organizationId, 'API_KEY_CREATED', 'ApiKey', {
    keyId: createdApiKey.id,
    keyName: createdApiKey.name,
  });

  return {
    id: createdApiKey.id,
    name: createdApiKey.name,
    key, // Return the actual key only once
    keyPrefix: createdApiKey.keyPrefix,
    createdAt: createdApiKey.createdAt,
  };
};

const getApiKeys = async (organizationId) => {
  const apiKeys = await apikeyRepository.findByOrganization(organizationId);
  
  return apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    lastUsed: key.lastUsed,
    isActive: key.isActive,
    createdAt: key.createdAt,
  }));
};

const rotateApiKey = async (keyId, organizationId) => {
  // Find existing key
  const existingKey = await apikeyRepository.findById(keyId);
  
  if (!existingKey || existingKey.organizationId !== organizationId) {
    throw new NotFoundError('API key not found');
  }

  // Generate new key
  const newKey = ApiKey.generateKey();
  const newKeyHash = ApiKey.generateKeyHash(newKey);
  const newKeyPrefix = ApiKey.getKeyPrefix(newKey);

  // Update API key
  await apikeyRepository.update(keyId, {
    keyHash: newKeyHash,
    keyPrefix: newKeyPrefix,
  });

  // Log audit
  await logAction(null, organizationId, 'API_KEY_ROTATED', 'ApiKey', {
    keyId,
    keyName: existingKey.name,
  });

  return {
    id: keyId,
    name: existingKey.name,
    key: newKey,
    keyPrefix: newKeyPrefix,
  };
};

const revokeApiKey = async (keyId, organizationId) => {
  // Find key
  const apiKey = await apikeyRepository.findById(keyId);
  
  if (!apiKey || apiKey.organizationId !== organizationId) {
    throw new NotFoundError('API key not found');
  }

  // Deactivate key
  await apikeyRepository.update(keyId, { isActive: false });

  // Log audit
  await logAction(null, organizationId, 'API_KEY_REVOKED', 'ApiKey', {
    keyId,
    keyName: apiKey.name,
  });

  return { message: 'API key revoked successfully' };
};

const verifyApiKey = async (key, organizationId) => {
  const keyHash = ApiKey.generateKeyHash(key);
  const apiKey = await apikeyRepository.findByKeyHash(keyHash);

  if (!apiKey || !apiKey.isActive || apiKey.organizationId !== organizationId) {
    throw new ValidationError('Invalid API key');
  }

  // Update last used timestamp
  await apikeyRepository.update(apiKey.id, { lastUsed: new Date().toISOString() });

  return apiKey;
};

module.exports = {
  createApiKey,
  getApiKeys,
  rotateApiKey,
  revokeApiKey,
  verifyApiKey,
};
