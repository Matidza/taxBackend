import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 5,
    },

    role: {
      type: String,
      enum: ["tax_payer", "business", "tax_practitioner", "admin"],
      default: "tax_payer",
    },

    name: {
      type: String,
      trim: true,
    },

    avatar: String,

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserModel", userSchema);


