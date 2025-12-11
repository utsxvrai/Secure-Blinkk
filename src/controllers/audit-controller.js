const auditService = require('../services/audit-service');
const { sendSuccess } = require('../utils/response');
const rbac = require('../middlewares/rbac');

const getOrganizationAuditLogs = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const { limit } = req.query;

    const result = await auditService.getOrganizationAuditLogs(organizationId, parseInt(limit) || 100);
    sendSuccess(res, result, 'Audit logs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getUserAuditLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { organizationId, id: currentUserId } = req.user;
    const { limit } = req.query;

    // Users can only see their own logs, admins can see anyone's
    if (req.user.role !== 'admin' && userId !== currentUserId) {
      return next(new Error('Unauthorized'));
    }

    const result = await auditService.getUserAuditLogs(userId, organizationId, parseInt(limit) || 50);
    sendSuccess(res, result, 'User audit logs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrganizationAuditLogs,
  getUserAuditLogs,
};
