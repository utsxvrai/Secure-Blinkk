const { v4: uuidv4 } = require('uuid');
const dynamoDB = require('../db/dynamoClient');
const config = require('../config');

const create = async (project) => {
  const params = {
    TableName: config.PROJECTS_TABLE,
    Item: {
      id: project.id || uuidv4(),
      organizationId: project.organizationId,
      name: project.name,
      description: project.description || '',
      owner: project.owner,
      isActive: project.isActive !== undefined ? project.isActive : true,
      createdAt: project.createdAt || Date.now(),
      updatedAt: new Date().toISOString(),
      metadata: project.metadata || {},
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }
};

const findById = async (id) => {
  const params = {
    TableName: config.PROJECTS_TABLE,
    Key: { id },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    throw new Error(`Failed to find project: ${error.message}`);
  }
};

const findByOrganization = async (organizationId) => {
  const params = {
    TableName: config.PROJECTS_TABLE,
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
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
};

const update = async (id, updates) => {
  const params = {
    TableName: config.PROJECTS_TABLE,
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
    throw new Error(`Failed to update project: ${error.message}`);
  }
};

const delete_ = async (id) => {
  const params = {
    TableName: config.PROJECTS_TABLE,
    Key: { id },
  };

  try {
    await dynamoDB.delete(params).promise();
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
};

module.exports = {
  create,
  findById,
  findByOrganization,
  update,
  delete: delete_,
};
