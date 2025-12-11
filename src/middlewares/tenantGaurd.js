const { AuthorizationError } = require('../utils/errors');

const tenantGuard = (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    return next(new AuthorizationError('User not authenticated'));
  }

  // Verify that the requested organizationId matches the user's organizationId
  const requestedOrgId = req.params.organizationId || req.query.organizationId || req.body?.organizationId;
  
  if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
    return next(new AuthorizationError('You do not have access to this organization'));
  }

  // Add organizationId to request for easy access in controllers
  req.organizationId = req.user.organizationId;
  next();
};

module.exports = tenantGuard;
