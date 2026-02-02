import mongoose from "mongoose";

const userOnboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    role: {
      type: String,
      enum: ["tax_payer", "business", "tax_practitioner", "admin"],
      default: "tax_payer",
      required: true,
    },

    saIdNumber: {
      type: String,
      minlength: 13,
      maxlength: 13,
      select: false,
      required: function () { return this.role === "tax_payer"; },
    },

    sarsTaxNumber: {
      type: String,
      minlength: 10,
      maxlength: 10,
      required: true,
    },

    vatNumber: {
      type: String,
      minlength: 10,
      maxlength: 10,
      required: function () { return this.role === "business"; },
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
      default: "individual",
    },

    isLivingTrust: {
      type: Boolean,
      default: false,
    },

    financialYearEnd: {
      type: String,
      enum: ["February", "March", "June", "December"],
      default: "February",
    },

    accountingIntegration: {
      type: String,
      enum: ["manual", "xero", "sage", "quickbooks", "pastel"],
      default: "manual",
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
  },
  { timestamps: true }
);

export default mongoose.model("UserOnboarding", userOnboardingSchema);
