const Joi = require('joi');

const createMeetingSchema = Joi.object({
  client_id: Joi.number().integer().required(),
  agent_id: Joi.number().integer().required(),
  scheduled_at: Joi.date().required(),
  meeting_link: Joi.string().uri().allow(null, ''),
});

const updateMeetingSchema = Joi.object({
  scheduled_at: Joi.date(),
  status: Joi.string().valid('PENDING', 'ACCEPTED', 'REJECTED'),
  meeting_link: Joi.string().uri().allow(null, ''),
}).min(1);

module.exports = {
  createMeetingSchema,
  updateMeetingSchema,
};
