import Joi from "joi";

// ✅ User ID
const userIdSchema = Joi.string().required().messages({
  "string.empty": "User ID is required.",
  "any.required": "User ID is required.",
});

// ✅ Onboarding profile ID
const onboardingProfileSchema = Joi.string().required().messages({
  "string.empty": "Onboarding profile ID is required.",
  "any.required": "Onboarding profile ID is required.",
});

// ✅ Tax year
const taxYearSchema = Joi.number()
  .integer()
  .min(2000)
  .max(new Date().getFullYear() + 1)
  .required()
  .messages({
    "number.base": "Tax year must be a number",
    "number.integer": "Tax year must be a valid year",
    "any.required": "Tax year is required",
  });

// ✅ Document type
const documentTypeSchema = Joi.string()
  .valid(
    "payslip",
    "irp5",
    "medical_certificate",
    "retirement_annuity",
    "vat_invoice",
    "bank_statement",
    "other"
  )
  .required()
  .messages({
    "any.only": "Document type must be a valid type",
    "any.required": "Document type is required",
  });

// ✅ File URL
const fileUrlSchema = Joi.string()
  .uri()
  .required()
  .messages({
    "string.uri": "File URL must be a valid URI",
    "any.required": "File URL is required",
  });

// ✅ Audit logs (optional)
const auditSchema = Joi.object({
  action: Joi.string(),
  performedBy: Joi.string().required(),
  ipAddress: Joi.string().ip({ version: ["ipv4", "ipv6"] }),
  userAgent: Joi.string(),
  timestamp: Joi.date().default(() => new Date()),
});

// ✅ Main validator
const userTaxDocumentSchema = Joi.object({
  userId: userIdSchema,
  onboardingProfile: onboardingProfileSchema,
  taxYear: taxYearSchema,
  documentType: documentTypeSchema,
  fileUrl: fileUrlSchema,
  audit: auditSchema,
});

export default userTaxDocumentSchema;
