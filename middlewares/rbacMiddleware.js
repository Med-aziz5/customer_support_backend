const ForbiddenError = require('../error/ForbiddenError');

const checkPermission = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError( 'Forbidden: You do not have permission');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkPermission;
