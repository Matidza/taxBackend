import mongoose from "mongoose";

const userTaxDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    onboardingProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserOnboarding",
      required: true,
    },

    taxYear: {
      type: Number,
      required: true,
    },

    documentType: {
      type: String,
      enum: [
        "payslip",
        "irp5",
        "medical_certificate",
        "retirement_annuity",
        "vat_invoice",
        "bank_statement",
        "other",
      ],
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserTaxDocument", userTaxDocumentSchema);
