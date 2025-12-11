const { v4: uuidv4 } = require('uuid');
const dynamoDB = require('../db/dynamoClient');
const config = require('../config');

const create = async (user) => {
  const params = {
    TableName: config.USERS_TABLE,
    Item: {
      id: user.id || uuidv4(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      role: user.role || 'user',
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

const findByEmail = async (email) => {
  const params = {
    TableName: config.USERS_TABLE,
    IndexName: 'emailOrganizationIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

const findById = async (id) => {
  const params = {
    TableName: config.USERS_TABLE,
    Key: { id },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

const update = async (id, updates) => {
  const params = {
    TableName: config.USERS_TABLE,
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
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

const findByOrganization = async (organizationId) => {
  const params = {
    TableName: config.USERS_TABLE,
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
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

module.exports = {
  create,
  findByEmail,
  findById,
  update,
  findByOrganization,
};
