const express = require('express');
const router = express.Router();

const { JWTVerify } = require('../../middlewares');

const ApiKeyRoutes = require('./apikey-route');
const UserRoutes = require('./user-route');
const ProjectRoutes = require('./project-route');
const AuthRoutes = require('./auth-route');

// Public Routes
router.use('/auth', AuthRoutes);

// Protected Routes
router.use(JWTVerify);
router.use('/apikeys', ApiKeyRoutes);
router.use('/users', UserRoutes);
router.use('/projects', ProjectRoutes);



module.exports = router;