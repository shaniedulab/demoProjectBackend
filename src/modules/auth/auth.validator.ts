import Joi from "joi";

// Define a schema for check valid email object
export const emailSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Invalid Email',
    })
});

// Define a schema for check valid email object
export const passwordSchema = Joi.object({
    password: Joi.string().required().min(6).messages({
      'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

// Define a schema for LoginForm object
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Invalid Email',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
});

// Define a schema for registerForm object
export const registerUserSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    // role: Joi.string().valid('ADMIN', 'USER').required(),
});

// Define a schema for registerForm object
export const updateUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});