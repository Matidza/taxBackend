import mongoose from "mongoose";

const userOnboardingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    taxYear: {
      type: Number,
      default: 2024,
    },

    taxpayerType: {
      type: String,
      enum: ["individual", "business", "tax_practitioner"],
      required: true,
    },

    saIdNumber: {
      type: String,
      minlength: 13,
      maxlength: 13,
      unique: true,
      sparse: true,
    },

    sarsTaxNumber: {
      type: String,
      minlength: 10,
      maxlength: 10,
      unique: true,
      sparse: true,
    },

    vatNumber: {
      type: String,
      minlength: 10,
      maxlength: 10,
    },

    businessStructure: {
      type: String,
      enum: [
        "individual",
        "sole_proprietor",
        "pty_ltd",
        "cc",
        "partnership",
        "trust",
      ],
    },

    financialYearEnd: {
      type: String,
      enum: ["February", "March", "June", "December"],
      default: "February",
    },

    estimatedAnnualIncome: {
      type: Number,
    },

    managedTaxes: [
      {
        type: String,
        enum: ["ITR12", "ITR14", "VAT201", "EMP201", "EMP501", "IRP6"],
      },
    ],

    accountingIntegration: {
      type: String,
      enum: ["manual", "xero", "sage", "quickbooks", "pastel"],
      default: "manual",
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserOnboarding", userOnboardingSchema);
