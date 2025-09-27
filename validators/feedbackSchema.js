const Joi = require('joi');

const createFeedbackSchema = Joi.object({
  ticket_id: Joi.number().integer().required().messages({
    'any.required': 'Ticket ID is required',
    'number.base': 'Ticket ID must be a number',
  }),
  client_id: Joi.number().integer().required().messages({
    'any.required': 'Client ID is required',
    'number.base': 'Client ID must be a number',
  }),
  content: Joi.string().min(1).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content cannot be empty',
  }),
});

const updateFeedbackSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content cannot be empty',
  }),
});

module.exports = {
  createFeedbackSchema,
  updateFeedbackSchema,
};
