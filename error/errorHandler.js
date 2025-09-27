const NotFoundError = require('./NotFoundError');
const Conflict = require('./ConflictError');
const TechnicalError = require('./TechnicalError');
const BusinessError = require('./BusinessError');
const ForbiddenError = require('./ForbiddenError');
const UnauthorizedError = require('./UnauthorizedError');

const errorHandler = (err, req, res, next) => {
  let statusCode;
  let response;

  if (err instanceof NotFoundError) {
    statusCode = err.statusCode || 404;
    response = new TechnicalError(
      'RESOURCE_NOT_FOUND',
      'The requested resource was not found',
    );
    response.details.detail = err.message;
    response.details.source = err.module;
  } else if (err instanceof Conflict) {
    statusCode = err.statusCode || 409;
    response = new TechnicalError('CONFLICT', 'Conflict error');
    response.details.detail = err.message;
    response.details.source = err.module;
  } else if (err instanceof ForbiddenError) {
    statusCode = err.statusCode || 403;
    response = new TechnicalError(
      'FORBIDDEN',
      'You do not have permission to perform this action',
    );
    response.details.detail = err.message;
    response.details.source = err.module;
  } else if (err instanceof UnauthorizedError) {
    statusCode = err.statusCode || 401;
    response = new TechnicalError(
      'UnauthorizedError',
      'Authentication required or failed',
    );
    response.details.detail = err.message;
    response.details.source = err.module;
  } else if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError'
  ) {
    statusCode = 400;
    response = new BusinessError('BAD_REQUEST', 'Validation error');
    err.errors.forEach((e) => {
      response.addDetail(e.path, e.message);
    });
  } else {
    statusCode = 500;
    response = new TechnicalError(
      'INTERNAL_SERVER_ERROR',
      err.name || 'INTERNAL_SERVER_ERROR',
    );
    response.details.detail = err.message;
    response.details.source = err.stack;
  }

  return res.status(statusCode).send(response);
};

module.exports = { errorHandler };
