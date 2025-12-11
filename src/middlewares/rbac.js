const { AuthorizationError } = require('../utils/errors');

const rbac = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`User role '${req.user.role}' does not have permission to access this resource`));
    }

    next();
  };
};

module.exports = rbac;
