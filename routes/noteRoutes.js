const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const noteValidators = require('../validators/noteSchema');
const validationMiddleware = require('../middlewares/validationMiddleware');
const filter = require('../middlewares/filter');
const verifyJWT = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');

router.get(
  '/',
  filter,
  verifyJWT,
  allowRoles('ADMIN'),
  noteController.getAllNotes,
);

router.get(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN', 'AGENT'),
  noteController.getNoteById,
);

router.get(
  '/tickets/:ticket_id',
  verifyJWT,
  allowRoles('ADMIN', 'AGENT'),
  noteController.getNotesByTicketId,
);

router.post(
  '/tickets/:ticketId',
  validationMiddleware(noteValidators.createNoteSchema),
  verifyJWT,
  allowRoles('ADMIN', 'AGENT'),
  noteController.createNote,
);

router.put(
  '/tickets/:id',
  validationMiddleware(noteValidators.updateNoteSchema),
  verifyJWT,
  allowRoles('ADMIN', 'AGENT'),
  noteController.updateNote,
);

router.delete(
  '/:id',
  verifyJWT,
  allowRoles('ADMIN', 'AGENT'),
  noteController.deleteNote,
);

module.exports = router;
