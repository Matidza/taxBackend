import Joi from "joi";

const emailSchema = Joi.string()
  .min(5).max(60).required()
  .email({ tlds: { allow: ["com", "net"] } })
  .messages({
    "string.email":
    "Email must be a valid email address with .com or .net domain.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
    "string.min": "Email must be at least 5 characters long.",
    "string.max": "Email must not exceed 60 characters.",
  });

const passwordPattern = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};:'\",.<>/?]).{8,}$"
);
const passwordSchema = Joi.string()
  .required().pattern(passwordPattern)
  .messages({
    "string.pattern.base":
    "Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.",
    "string.empty": "Password cannot be empty.",
    "any.required": "Password is required.",
  });
const providedCodeSchema = Joi.number()
  .required()
  .messages({
    "number.base": "Provided code must be a number.",
    "any.required": "Provided code is required.",
  });



const oldPasswordSchema = passwordSchema;
const newPasswordSchema = passwordSchema;

const changePasswordSchema = Joi.object({
  oldPassword: oldPasswordSchema,
  newPassword: newPasswordSchema,
});

const sendCodeSchema = Joi.object({
  email: emailSchema,
});

const acceptForgotPasswordSchema = Joi.object({
  email: Joi.string()
    .min(5).max(60).required()
    .email({ tlds: { allow: false } }),
  providedCodeValue: providedCodeSchema,
  newPassword: passwordSchema,
});

const boardSchema = Joi.string().min(5)
const boardsSchema = Joi.string().min(5)
const userIdSchema = Joi.string().required()
    .messages({
    "string.empty": "User ID is required.",
    "any.required": "User ID is required."
});
const taxNumber = Joi.string().required().max(8)

// ✅ Main schema
const onBoardingSchema = Joi.object({
  title: boardSchema,
  type: boardsSchema,
  userId: userIdSchema,
  tax_number: taxNumber
});



// ✅ Export schemas
export {
  changePasswordSchema, sendCodeSchema, 
  acceptForgotPasswordSchema, onBoardingSchema
};
