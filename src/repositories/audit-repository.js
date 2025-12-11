const { v4: uuidv4 } = require('uuid');
const dynamoDB = require('../db/dynamoClient');
const config = require('../config');

const create = async (auditLog) => {
  const params = {
    TableName: config.AUDIT_TABLE,
    Item: {
      id: auditLog.id || uuidv4(),
      userId: auditLog.userId,
      organizationId: auditLog.organizationId,
      action: auditLog.action,
      resource: auditLog.resource,
      details: auditLog.details || {},
      timestamp: auditLog.timestamp || Math.floor(Date.now() / 1000),
      ipAddress: auditLog.ipAddress || 'N/A',
      userAgent: auditLog.userAgent || 'N/A',
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    throw new Error(`Failed to create audit log: ${error.message}`);
  }
};

const findByOrganization = async (organizationId, limit = 100) => {
  const params = {
    TableName: config.AUDIT_TABLE,
    IndexName: 'organizationIdTimestampIndex',
    KeyConditionExpression: 'organizationId = :organizationId',
    ExpressionAttributeValues: {
      ':organizationId': organizationId,
    },
    ScanIndexForward: false,
    Limit: limit,
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }
};

const findByUser = async (userId, organizationId, limit = 50) => {
  const params = {
    TableName: config.AUDIT_TABLE,
    IndexName: 'userIdTimestampIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':organizationId': organizationId,
    },
    FilterExpression: 'organizationId = :organizationId',
    ScanIndexForward: false,
    Limit: limit,
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    throw new Error(`Failed to fetch user audit logs: ${error.message}`);
  }
};

module.exports = {
  create,
  findByOrganization,
  findByUser,
};
