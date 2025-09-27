const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const authValidators = require('../validators/authSchema');
const verifyJwt = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');

router.post(
  '/register',
  validationMiddleware(authValidators.registerSchema),
  authController.register,
);
router.post(
  '/create-agent',
  verifyJwt,
  allowRoles('ADMIN'),
  validationMiddleware(authValidators.registerSchema),
  authController.createAgent,
);
router.post(
  '/login',
  validationMiddleware(authValidators.loginSchema),
  authController.login,
);
router.get('/users/me', verifyJwt, authController.getUserDetails);
router.post('/token', verifyJwt, authController.refresh);
router.post('/logout', verifyJwt, authController.logout);
router.post('/forgot-password', verifyJwt, authController.requestPasswordReset);
router.post('/reset-password', verifyJwt, authController.resetPasswordWithCode);
router.post(
  '/change-password',
  verifyJwt,
  validationMiddleware(authValidators.changePasswordSchema),
  authController.changePassword,
);

module.exports = router;
