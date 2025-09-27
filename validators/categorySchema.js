const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional()
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
