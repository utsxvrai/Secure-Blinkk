const express = require('express');
const apikeyController = require('../../controllers/apikey-controller');
const jwtVerify = require('../../middlewares/jwtverify');
const rbac = require('../../middlewares/rbac');

const router = express.Router();

// All routes require JWT authentication
router.use(jwtVerify);

// API key management (admin/manager only)
router.post('/', rbac(['admin', 'manager']), apikeyController.createApiKey);
router.get('/', apikeyController.getApiKeys);
router.post('/:keyId/rotate', rbac(['admin', 'manager']), apikeyController.rotateApiKey);
router.delete('/:keyId', rbac(['admin']), apikeyController.revokeApiKey);

module.exports = router;
