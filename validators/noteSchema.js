const Joi = require('joi');

const createNoteSchema = Joi.object({
  ticket_id: Joi.number().integer().required().messages({
    'any.required': 'Ticket ID is required',
    'number.base': 'Ticket ID must be a number',
  }),
  content: Joi.string().min(1).required().messages({
    'any.required': 'Content is required',
    'string.base': 'Content must be a string',
    'string.empty': 'Content cannot be empty',
  }),
});

const updateNoteSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    'any.required': 'Content is required',
    'string.base': 'Content must be a string',
    'string.empty': 'Content cannot be empty',
  }),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
};
