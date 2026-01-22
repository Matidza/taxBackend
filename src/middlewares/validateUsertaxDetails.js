import Joi from "joi";

// ✅ USER ID
const userIdSchema = Joi.string().required().messages({
  "string.empty": "User ID is required.",
  "any.required": "User ID is required.",
});

// ✅ Taxpayer info
const taxpayerTypeSchema = Joi.string()
  .valid("individual", "business", "tax_practitioner")
  .required()
  .messages({
    "any.only": "Taxpayer type must be individual, business, or tax_practitioner",
    "any.required": "Taxpayer type is required",
  });

const saIdNumberSchema = Joi.string()
  .pattern(/^\d{13}$/)
  .optional()
  .messages({
    "string.pattern.base": "SA ID number must be exactly 13 digits",
  });

const sarsTaxNumberSchema = Joi.string()
  .pattern(/^\d{10}$/)
  .required()
  .messages({
    "string.pattern.base": "SARS Tax number must be exactly 10 digits",
    "any.required": "SARS Tax number is required",
  });

const vatNumberSchema = Joi.string()
  .pattern(/^\d{10}$/)
  .optional()
  .messages({
    "string.pattern.base": "VAT number must be exactly 10 digits",
  });

// ✅ Business info
const businessStructureSchema = Joi.string().valid(
  "individual",
  "sole_proprietor",
  "pty_ltd",
  "cc",
  "partnership",
  "trust"
);

const financialYearEndSchema = Joi.string()
  .valid("February", "March", "June", "December")
  .default("February");

const estimatedAnnualIncomeSchema = Joi.number()
  .min(0)
  .optional()
  .messages({ "number.base": "Estimated annual income must be a number" });

const managedTaxesSchema = Joi.array()
  .items(Joi.string().valid("ITR12", "ITR14", "VAT201", "EMP201", "EMP501", "IRP6"))
  .min(1)
  .messages({ "array.min": "At least one tax type must be selected" });

const accountingIntegrationSchema = Joi.string().valid(
  "manual",
  "xero",
  "sage",
  "quickbooks",
  "pastel"
).default("manual");

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

// ✅ Audit logs
const auditSchema = Joi.object({
  action: Joi.string().required(),
  performedBy: Joi.string().required(),
  ipAddress: Joi.string().ip({ version: ["ipv4", "ipv6"] }).required(),
  userAgent: Joi.string().required(),
  timestamp: Joi.date().default(() => new Date()),
});

// ✅ Onboarding validator
const onBoardingSchema = Joi.object({
  user: userIdSchema,
  taxpayerType: taxpayerTypeSchema,
  saIdNumber: saIdNumberSchema,
  sarsTaxNumber: sarsTaxNumberSchema,
  vatNumber: vatNumberSchema.optional(),
  businessStructure: businessStructureSchema,
  financialYearEnd: financialYearEndSchema,
  estimatedAnnualIncome: estimatedAnnualIncomeSchema,
  managedTaxes: managedTaxesSchema,
  accountingIntegration: accountingIntegrationSchema,
  taxYear: taxYearSchema,
  audit: auditSchema.required(),
});

export { onBoardingSchema };
