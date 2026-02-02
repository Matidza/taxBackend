import Joi from "joi";

// =========================
// ✅ SIGNUP VALIDATION
// =========================
export const signUpSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } })
    .messages({
      "string.email": "Email must be a valid email address with .com or .net domain.",
      "string.empty": "Email cannot be empty.",
      "any.required": "Email is required.",
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters.",
      "any.required": "Password is required.",
    }),
  name: Joi.string().min(2).max(50).optional(),
  avatar: Joi.string()
});

// =========================
// ✅ SIGNIN VALIDATION
// =========================
export const signInSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

// =========================
// ✅ PASSWORD CHANGE
// =========================
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
});

// =========================
// ✅ FORGOT PASSWORD
// =========================
export const sendCodeSchema = Joi.object({
  email: Joi.string().required().email(),
});

export const acceptForgotPasswordSchema = Joi.object({
  email: Joi.string().required().email(),
  providedCodeValue: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});

// =========================
// ✅ USER UPDATE PROFILE
// =========================
export const updateUserModelSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().required().email(),
  avatar: Joi.string().optional(),
});
