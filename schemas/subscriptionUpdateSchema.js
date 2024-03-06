import Joi from "joi";

const subscriptionValues = ["starter", "pro", "business"];

export const subscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...subscriptionValues)
    .required(),
});
