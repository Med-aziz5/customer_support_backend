const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const meetingValidators = require('../validators/meetingSchema');
const validationMiddleware = require('../middlewares/validationMiddleware');
const filter = require('../middlewares/filter');
const verifyJWT = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');

router.get(
  '/',
  filter,
  verifyJWT,
  allowRoles('ADMIN'),
  meetingController.getAllMeetings,
);

router.get(
  '/ticket/:ticketId',
  verifyJWT,
  allowRoles('ADMIN'),
  meetingController.getMeetingsByTicketId,
);

router.get('/:id', verifyJWT, meetingController.getMeetingById);

router.post(
  '/ticket/:ticket_id',
  validationMiddleware(meetingValidators.createMeetingSchema),
  verifyJWT,
  meetingController.createMeeting,
);
router.post('/request/:ticket_id', verifyJWT, meetingController.requestMeeting);

router.put(
  '/ticket/:id',
  validationMiddleware(meetingValidators.updateMeetingSchema),
  verifyJWT,
  meetingController.updateMeeting,
);

router.delete(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN'),
  meetingController.deleteMeeting,
);

module.exports = router;
