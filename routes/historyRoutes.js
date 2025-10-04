const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const filter = require('../middlewares/filter');
const verifyJWT = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');

router.get(
  '/',
  filter,
  verifyJWT,
  allowRoles('ADMIN'),
  historyController.getAllHistory,
);

router.get(
  '/tickets/:ticketId',
  verifyJWT,
  historyController.getHistoryByTicket,
);

router.delete(
  ':id',
  verifyJWT,
  allowRoles('ADMIN'),
  historyController.deleteHistory,
);

module.exports = router;
