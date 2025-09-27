const express = require('express');
const router = express.Router();
const {
  getNotificationsByUser,
  markNotificationAsRead,
} = require('../controllers/notificationController');
const verifyJWT = require('../middlewares/verifyJWT');
const filter = require('../middlewares/filter');

router.get('/users/:userId', verifyJWT, filter, getNotificationsByUser);
router.patch('/notifications/:id/read', verifyJWT, markNotificationAsRead);
module.exports = router;
