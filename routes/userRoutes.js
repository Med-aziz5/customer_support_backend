const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidators = require('../validators/userSchema');
const validationMiddleware = require('../middlewares/validationMiddleware');
const allowRoles = require('../middlewares/rbacMiddleware');
const verifyJWT = require('../middlewares/verifyJWT');
const filter = require('../middlewares/filter');

router.get(
  '/',
  verifyJWT,
  filter,
  allowRoles('ADMIN'),
  userController.getAllUsers,
);

router.get(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN', 'AGENT'),
  userController.getUserById,
);

router.put(
  '/:id',
  validationMiddleware(userValidators.updateUserSchema),
  verifyJWT,
  allowRoles('ADMIN'),
  userController.updateUser,
);

router.delete(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN'),
  userController.deleteUser,
);

module.exports = router;
