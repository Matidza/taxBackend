import mongoose from "mongoose";

const userTaxDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
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
      index: true,
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
        "trust_deed",
        "other",
      ],
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "submitted", "processed", "approved"],
      default: "pending",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique per user per tax year per document type
userTaxDocumentSchema.index({ userId: 1, taxYear: 1, documentType: 1 }, { unique: true });

export default mongoose.model("UserTaxDocument", userTaxDocumentSchema);
