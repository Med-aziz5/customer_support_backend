const Joi = require('joi');

const allowedRoles = ['CLIENT', 'AGENT', 'ADMIN'];
const allowedStatuses = [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'DELETED',
  'PENDING',
];

module.exports = {
  updateUserSchema: {
    body: Joi.object({
      first_name: Joi.string().min(2),
      last_name: Joi.string().min(2),
      email: Joi.string().email(),
    }),
  },
};
