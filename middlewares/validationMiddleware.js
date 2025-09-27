const Joi = require('joi');

module.exports = (options) => {
  return (req, res, next) => {
    let result;

    if (options.header) {
      result = options.header.validate(req.headers);
      if (result.error) return next(result.error);
    }

    if (options.body) {
      result = options.body.validate(req.body);
      if (result.error) return next(result.error);
    }

    next();
  };
};
