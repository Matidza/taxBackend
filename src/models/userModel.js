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
      enum: ["individual", "business", "tax_practitioner", "admin"],
      default: "individual",
    },

    fullName: {
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

export default mongoose.model("User", userSchema);


