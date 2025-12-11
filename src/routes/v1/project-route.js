const express = require('express');
const projectController = require('../../controllers/project-controller');
const jwtVerify = require('../../middlewares/jwtverify');
const rbac = require('../../middlewares/rbac');

const router = express.Router();

// All routes require JWT authentication
router.use(jwtVerify);

// Project management
router.post('/', rbac(['admin', 'manager']), projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:projectId', projectController.getProjectById);
router.put('/:projectId', rbac(['admin', 'manager']), projectController.updateProject);
router.delete('/:projectId', rbac(['admin']), projectController.deleteProject);

module.exports = router;
