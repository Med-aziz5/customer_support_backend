const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const commentValidators = require('../validators/commentSchema');
const verifyjwt = require('../middlewares/verifyJWT');
const filter = require('../middlewares/filter');
const allowRoles = require('../middlewares/rbacMiddleware');

router.get(
  '/',
  filter,
  verifyjwt,
  allowRoles('ADMIN'),
  commentController.getComments,
);

router.get(
  '/ticket/:ticketId',
  verifyjwt,
  allowRoles('ADMIN', 'AGENT'),
  commentController.getCommentsByTicket,
);

router.get('/:id', verifyjwt, commentController.getCommentById);

router.post(
  '/ticket/:ticket_id',
  validationMiddleware(commentValidators.createCommentSchema),
  verifyjwt,
  commentController.createComment,
);

router.put(
  '/:id',
  validationMiddleware(commentValidators.updateCommentSchema),
  allowRoles('ADMIN', 'AGENT'),
  verifyjwt,
  commentController.updateComment,
);

router.delete(
  '/:id',
  verifyjwt,
  allowRoles('ADMIN'),
  commentController.deleteComment,
);

module.exports = router;
