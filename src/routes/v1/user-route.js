const express = require('express');
const userController = require('../../controllers/user-controller');
const jwtVerify = require('../../middlewares/jwtverify');
const rbac = require('../../middlewares/rbac');

const router = express.Router();

// All routes require JWT authentication
router.use(jwtVerify);

// User management (admin/manager only)
router.post('/', rbac(['admin', 'manager']), userController.createUser);
router.get('/', userController.getOrganizationUsers);
router.put('/:userId', rbac(['admin', 'manager']), userController.updateUser);
router.delete('/:userId', rbac(['admin']), userController.deactivateUser);

// Profile management (self)
router.post('/change-password', userController.changePassword);

module.exports = router;
