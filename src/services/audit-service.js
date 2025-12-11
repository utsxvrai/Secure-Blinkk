const auditRepository = require('../repositories/audit-repository');

const getOrganizationAuditLogs = async (organizationId, limit = 100) => {
  const logs = await auditRepository.findByOrganization(organizationId, limit);
  
  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    userId: log.userId,
    timestamp: log.timestamp,
    details: log.details,
    ipAddress: log.ipAddress,
  }));
};

const getUserAuditLogs = async (userId, organizationId, limit = 50) => {
  const logs = await auditRepository.findByUser(userId, organizationId, limit);
  
  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    timestamp: log.timestamp,
    details: log.details,
    ipAddress: log.ipAddress,
  }));
};

module.exports = {
  getOrganizationAuditLogs,
  getUserAuditLogs,
};
