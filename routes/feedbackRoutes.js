const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const feedbackValidators = require('../validators/feedbackSchema');
const validationMiddleware = require('../middlewares/validationMiddleware');
const verifyJWT = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');
const filter = require('../middlewares/filter');

router.get(
  '/',
  verifyJWT,
  filter,
  allowRoles('ADMIN'),
  feedbackController.getAllFeedbacks,
);

router.get(
  '/best-agent',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getBestRatedAgent,
);

router.get(
  '/worst-agent',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getWorstRatedAgent,
);

router.get(
  '/agent/:agentId',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getFeedbackByAgent,
);

router.get(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getFeedbackById,
);

router.put(
  '/:id',
  validationMiddleware(feedbackValidators.updateFeedbackSchema),
  verifyJWT,
  feedbackController.updateFeedback,
);

router.delete(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.deleteFeedback,
);

router.get(
  '/my-average',
  verifyJWT,
  allowRoles('CLIENT'),
  feedbackController.getMyAverageRating,
);

router.post(
  '/ticket/:ticket_id',
  validationMiddleware(feedbackValidators.createFeedbackSchema),
  verifyJWT,
  feedbackController.createFeedback,
);

module.exports = router;
