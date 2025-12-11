const { v4: uuidv4 } = require('uuid');
const dynamoDB = require('../db/dynamoClient');
const config = require('../config');

const create = async (organization) => {
  const params = {
    TableName: config.ORGANIZATIONS_TABLE || `organizations-${process.env.NODE_ENV || 'dev'}`,
    Item: {
      id: organization.id || uuidv4(),
      name: organization.name,
      owner: organization.owner,
      isActive: organization.isActive !== undefined ? organization.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: organization.metadata || {},
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    throw new Error(`Failed to create organization: ${error.message}`);
  }
};

const findById = async (id) => {
  const params = {
    TableName: config.ORGANIZATIONS_TABLE || `organizations-${process.env.NODE_ENV || 'dev'}`,
    Key: { id },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    throw new Error(`Failed to find organization: ${error.message}`);
  }
};

const findByName = async (name) => {
  const params = {
    TableName: config.ORGANIZATIONS_TABLE || `organizations-${process.env.NODE_ENV || 'dev'}`,
    IndexName: 'nameIndex',
    KeyConditionExpression: 'name = :name',
    ExpressionAttributeValues: {
      ':name': name,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    throw new Error(`Failed to find organization: ${error.message}`);
  }
};

const update = async (id, updates) => {
  const params = {
    TableName: config.ORGANIZATIONS_TABLE || `organizations-${process.env.NODE_ENV || 'dev'}`,
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
    throw new Error(`Failed to update organization: ${error.message}`);
  }
};

module.exports = {
  create,
  findById,
  findByName,
  update,
};
