const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const ticketValidators = require('../validators/ticketSchema');
const verifyJWT = require('../middlewares/verifyJWT');
const allowRoles = require('../middlewares/rbacMiddleware');
const filter = require('../middlewares/filter');

router.get(
  '/',
  verifyJWT,
  filter,
  allowRoles('ADMIN', 'AGENT'),
  ticketController.getAllTickets,
);
router.get(
  '/assigned-to-me',
  verifyJWT,
  filter,
  allowRoles('ADMIN', 'AGENT'),
  ticketController.getMyAssignedTickets,
);
router.get('/user', verifyJWT, ticketController.getTicketsByUser);

router.get('/:id', verifyJWT, ticketController.getTicketById);

router.get(
  '/stats/my-solved/',
  verifyJWT,
  allowRoles('AGENT', 'ADMIN'),
  ticketController.getMySolvedTickets,
);

router.get(
  '/stats/total-solved/',
  verifyJWT,
  ticketController.getTotalSolvedTickets,
);
router.get(
  '/stats/total-by-user/',
  verifyJWT,
  ticketController.getTotalTicketsByUser,
);
router.get(
  '/stats/best-agent/',
  verifyJWT,
  allowRoles('ADMIN'),
  ticketController.getAgentWithMostSolvedTickets,
);
router.get(
  '/stats/total/',
  verifyJWT,
  allowRoles('ADMIN'),
  ticketController.getTotalTickets,
);
router.get(
  '/stats/worst-agent/',
  verifyJWT,
  allowRoles('ADMIN'),
  ticketController.getAgentWithLeastSolvedTickets,
);

router.post(
  '/',
  validationMiddleware(ticketValidators.createTicketSchema),
  verifyJWT,
  ticketController.createTicket,
);

router.post(
  '/assign/:ticketId',
  verifyJWT,
  allowRoles('ADMIN'),
  ticketController.assignTicket,
);

router.patch(
  '/ADMIN/:id',
  validationMiddleware(ticketValidators.updateTicketSchema),
  verifyJWT,
  allowRoles('ADMIN'),
  ticketController.updateTicketByAdmin,
);
router.patch(
  '/CLIENT/:id',
  validationMiddleware(ticketValidators.updateTicketSchema),
  verifyJWT,
  allowRoles('CLIENT'),
  ticketController.updateTicketByClient,
);
router.patch(
  '/assign-to-self/:ticketId',
  verifyJWT,
  allowRoles('AGENT', 'ADMIN'),
  ticketController.assignTicketToSelf,
);
router.put(
  '/:id/resolve',
  verifyJWT,
  allowRoles('AGENT', 'ADMIN'),
  ticketController.resolveTicket,
);

router.delete(
  '/:id',
  allowRoles('ADMIN'),
  verifyJWT,
  ticketController.deleteTicket,
);

module.exports = router;
