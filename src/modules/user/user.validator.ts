import Joi from "joi";
import customJOIMessages from "../../utils/customJoiMessage.util";

// Define a schema for registerForm object
export const updateUserSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
}).options({ messages: customJOIMessages });