const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const feedbackValidators = require('../validators/feedbackSchema');
const validationMiddleware = require('../middlewares/validationMiddleware');
const verifyJWT = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');
const filter = require('../middlewares/filter');

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// Get all feedbacks with optional filtering
router.get(
  '/',
  verifyJWT,
  filter,
  allowRoles('ADMIN'),
  feedbackController.getAllFeedbacks,
);

// Get the best rated agent
router.get(
  '/best-agent',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getBestRatedAgent,
);

// Get the worst rated agent
router.get(
  '/worst-agent',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getWorstRatedAgent,
);

// Get feedbacks by a specific agent
router.get(
  '/agent/:agentId',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getFeedbackByAgent,
);

// Get feedback by ID (keep last to avoid conflicts)
router.get(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.getFeedbackById,
);

// Update a feedback by ID
router.put(
  '/:id',
  validationMiddleware(feedbackValidators.updateFeedbackSchema),
  verifyJWT,
  feedbackController.updateFeedback,
);

// Delete a feedback by ID
router.delete(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN'),
  feedbackController.deleteFeedback,
);

/**
 * =========================
 * CLIENT ROUTES
 * =========================
 */

// Get the current client's average rating
router.get(
  '/my-average',
  verifyJWT,
  allowRoles('CLIENT'),
  feedbackController.getMyAverageRating,
);

// Create a feedback for a ticket
router.post(
  '/ticket/:ticket_id',
  validationMiddleware(feedbackValidators.createFeedbackSchema),
  verifyJWT,
  feedbackController.createFeedback,
);

module.exports = router;
