import Joi from "joi";
import customJOIMessages from "../../utils/customJoiMessage.util";

// Define a schema for check valid email object
export const emailSchema = Joi.object({
    email: Joi.string().email().required()
}).options({ messages: customJOIMessages });

// Define a schema for check valid email object
export const passwordSchema = Joi.object({
    password: Joi.string().required().min(6),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
}).options({ messages: customJOIMessages });

// Define a schema for LoginForm object
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
}).options({ messages: customJOIMessages });

// Define a schema for registerForm object
export const registerUserSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    // role: Joi.string().valid('ADMIN', 'USER').required(),
}).options({ messages: customJOIMessages });
