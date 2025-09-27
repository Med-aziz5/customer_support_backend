const ForbiddenError = require('../error/ForbiddenError');
const NotFoundError = require('../error/NotFoundError');

const checkOwnership = (Model, idField = 'clientId') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);
      if (!resource) throw new NotFoundError('Resource not found');

      if (resource[idField].toString() !== req.user.id) {
        throw new ForbiddenError('Forbidden: You do not own this resource');
      }

      req.resource = resource; // attach for downstream handlers
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkOwnership;
