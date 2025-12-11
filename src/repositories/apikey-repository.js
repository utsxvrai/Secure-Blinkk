const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const dynamoDB = require('../db/dynamoClient');
const config = require('../config');

const generateKeyHash = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

const create = async (apiKey) => {
  const params = {
    TableName: config.API_KEYS_TABLE,
    Item: {
      id: apiKey.id || uuidv4(),
      organizationId: apiKey.organizationId,
      name: apiKey.name,
      keyHash: apiKey.keyHash,
      keyPrefix: apiKey.keyPrefix,
      lastUsed: null,
      isActive: apiKey.isActive !== undefined ? apiKey.isActive : true,
      createdAt: Date.now(),
      updatedAt: new Date().toISOString(),
      metadata: apiKey.metadata || {},
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }
};

const findById = async (id) => {
  const params = {
    TableName: config.API_KEYS_TABLE,
    Key: { id },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    throw new Error(`Failed to find API key: ${error.message}`);
  }
};

const findByKeyHash = async (keyHash) => {
  const params = {
    TableName: config.API_KEYS_TABLE,
    IndexName: 'keyHashIndex',
    KeyConditionExpression: 'keyHash = :keyHash',
    ExpressionAttributeValues: {
      ':keyHash': keyHash,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    throw new Error(`Failed to find API key: ${error.message}`);
  }
};

const findByOrganization = async (organizationId) => {
  const params = {
    TableName: config.API_KEYS_TABLE,
    IndexName: 'organizationIdIndex',
    KeyConditionExpression: 'organizationId = :organizationId',
    ExpressionAttributeValues: {
      ':organizationId': organizationId,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }
};

const update = async (id, updates) => {
  const params = {
    TableName: config.API_KEYS_TABLE,
    Key: { id },
    UpdateExpression: 'SET ' + Object.keys(updates).map((key) => `${key} = :${key}`).join(', ') + ', updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ...Object.entries(updates).reduce((acc, [key, value]) => {
        acc[`:${key}`] = value;
        return acc;
      }, {}),
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  } catch (error) {
    throw new Error(`Failed to update API key: ${error.message}`);
  }
};

const delete_ = async (id) => {
  const params = {
    TableName: config.API_KEYS_TABLE,
    Key: { id },
  };

  try {
    await dynamoDB.delete(params).promise();
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
};

module.exports = {
  create,
  findById,
  findByKeyHash,
  findByOrganization,
  update,
  delete: delete_,
  generateKeyHash,
};
