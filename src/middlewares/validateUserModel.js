import Joi from "joi";

const emailSchema = Joi.string()
  .min(5)
  .max(60)
  .email({ tlds: { allow: ["com", "net"] } })
  .required()
  .messages({
    "string.email": "Email must be a valid email address with .com or .net domain.",
    "string.empty": "Email cannot be empty.",
    "string.min": "Email must be at least 5 characters long.",
    "string.max": "Email must not exceed 60 characters.",
  });

const passwordPattern = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};:'\",.<>/?]).{8,}$"
);

const passwordSchema = Joi.string()
  .pattern(passwordPattern)
  .required()
  .messages({
    "string.pattern.base":
      "Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.",
    "string.empty": "Password cannot be empty.",
    "any.required": "Password is required.",
  });

const nameSchema = Joi.string()
  .min(3)
  .max(60)
  .messages({
    "string.empty": "Name cannot be empty.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 60 characters.",
  });

const avatarSchema = Joi.string().optional();

const updateUserModelSchema = Joi.object({
  email: emailSchema,
  name: nameSchema,
  avatar: avatarSchema,
});

const signUpSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const signInSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

export { signUpSchema, signInSchema, updateUserModelSchema };

