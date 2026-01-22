// models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    taxYear: Number,

    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_ONBOARDING",
        "UPDATE_ONBOARDING",
        "UPLOAD_DOCUMENT",
        "DELETE_DOCUMENT",
        "SUBMIT_RETURN",
        "LOGIN",
        "LOGOUT",
        "PASSWORD_CHANGE",
      ],
    },

    entity: {
      type: String,
      enum: ["User", "UserOnboarding", "UserTaxDocument"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    ipAddress: String,

    userAgent: String,

    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
