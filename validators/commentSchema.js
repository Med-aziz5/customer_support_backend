const Joi = require('joi');

const createCommentSchema = Joi.object({
  ticket_id: Joi.number().integer().required().messages({
    'any.required': 'Ticket ID is required',
    'number.base': 'Ticket ID must be a number',
  }),
  content: Joi.string().min(1).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content cannot be empty',
    'string.min': 'Content must be at least 1 character',
  }),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content cannot be empty',
    'string.min': 'Content must be at least 1 character',
  }),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
