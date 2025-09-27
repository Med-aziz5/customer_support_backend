const Joi = require('joi');

const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
      }),

    password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password cannot exceed 128 characters',
    }),
  }),
};

const registerSchema = {
  body: Joi.object().keys({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(6).required(),
  }),
};

const changePasswordSchema = {
  body: Joi.object().keys({
    old_password: Joi.string().required().messages({
      'string.empty': 'Old password is required',
    }),
    new_password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password cannot exceed 128 characters',
    }),
    confirm_password: Joi.string()
      .valid(Joi.ref('new_password'))
      .required()
      .messages({
        'any.only': 'Confirm password must match new password',
        'string.empty': 'Confirm password is required',
      }),
  }),
};

module.exports = { loginSchema, registerSchema, changePasswordSchema };
