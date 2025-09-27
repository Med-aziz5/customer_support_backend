const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../error/UnauthorizedError');
const ForbiddenError = require('../error/ForbiddenError');

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('UnauthorizedError: No token provided');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        throw new ForbiddenError('Forbidden: Invalid token');
      }
      req.user = {
        id: decoded.UserInfo.id,
        role: decoded.UserInfo.role,
      };

      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = verifyJWT;
