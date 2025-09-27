const Joi = require('joi');

const createTicketSchema = Joi.object({
  user_id: Joi.string().required(),
  category_id: Joi.string().required(),
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow(null, ''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').required(),
});

const updateTicketSchema = Joi.object({
  user_id: Joi.string().required(),
  title: Joi.string().min(3).max(255).required(),
  category_id: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').required(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
}).min(1);

module.exports = {
  createTicketSchema,
  updateTicketSchema,
};
