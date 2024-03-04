import Joi from "joi";

export const usersRegisterSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
