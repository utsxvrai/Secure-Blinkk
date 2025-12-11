const express = require('express');
const auditController = require('../../controllers/audit-controller');
const jwtVerify = require('../../middlewares/jwtverify');
const rbac = require('../../middlewares/rbac');

const router = express.Router();

// All routes require JWT authentication
router.use(jwtVerify);

// Audit logs (admin only)
router.get('/', rbac(['admin']), auditController.getOrganizationAuditLogs);
router.get('/:userId', auditController.getUserAuditLogs);

module.exports = router;
