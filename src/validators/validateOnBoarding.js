import Joi from "joi";

const userIdSchema = Joi.string().required();

const taxpayerTypeSchema = Joi.string()
  .valid("tax_payer", "business", "tax_practitioner", "admin")
  .required();

const saIdNumberSchema = Joi.string()
  .pattern(/^\d{13}$/)
  .when('role', { is: 'tax_payer', then: Joi.required() })
  .messages({
    "string.pattern.base": "SA ID number must be exactly 13 digits",
    "any.required": "SA ID number is required for tax_payers",
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
  .when('role', { is: 'business', then: Joi.required() })
  .messages({
    "string.pattern.base": "VAT number must be exactly 10 digits",
    "any.required": "VAT number is required for businesses",
  });

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

const estimatedAnnualIncomeSchema = Joi.number().min(0).optional();

const managedTaxesSchema = Joi.array()
  .items(Joi.string().valid("ITR12", "ITR14", "VAT201", "EMP201", "EMP501", "IRP6"))
  .default((parent) => {
    if (parent.role === "tax_payer" && parent.businessStructure === "individual") return ["ITR12"];
    if (parent.role === "tax_payer" && parent.businessStructure === "trust") return ["ITR14"];
    if (parent.role === "business" || parent.businessStructure === "pty_ltd") return ["VAT201"];
    return [];
  })
  .min(1);

const accountingIntegrationSchema = Joi.string()
  .valid("manual", "xero", "sage", "quickbooks", "pastel")
  .default("manual");

const taxYearSchema = Joi.number()
  .integer()
  .min(2000)
  .max(new Date().getFullYear() + 1)
  .required();

const auditSchema = Joi.object({
  action: Joi.string(),
  performedBy: Joi.string().required(),
  ipAddress: Joi.string().ip({ version: ["ipv4", "ipv6"] }),
  userAgent: Joi.string(),
  timestamp: Joi.date().default(() => new Date()),
});

const onBoardingSchema = Joi.object({
  userId: userIdSchema,
  role: taxpayerTypeSchema,
  saIdNumber: saIdNumberSchema,
  sarsTaxNumber: sarsTaxNumberSchema,
  vatNumber: vatNumberSchema,
  businessStructure: businessStructureSchema,
  financialYearEnd: financialYearEndSchema,
  estimatedAnnualIncome: estimatedAnnualIncomeSchema,
  managedTaxes: managedTaxesSchema,
  accountingIntegration: accountingIntegrationSchema,
  taxYear: taxYearSchema,
  audit: auditSchema,
});

export default onBoardingSchema;
