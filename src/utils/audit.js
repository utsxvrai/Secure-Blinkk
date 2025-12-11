const { v4: uuidv4 } = require('uuid');
const auditRepository = require('../repositories/audit-repository');

const logAction = async (userId, organizationId, action, resource, details = {}) => {
  try {
    const auditLog = {
      id: uuidv4(),
      userId,
      organizationId,
      action,
      resource,
      details,
      timestamp: Date.now(),
      ipAddress: details.ipAddress || 'N/A',
      userAgent: details.userAgent || 'N/A',
    };

    await auditRepository.create(auditLog);
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - audit logging should not block operations
  }
};

module.exports = {
  logAction,
};
