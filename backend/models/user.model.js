import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    assets: { type: [String], default: [] },
    investorType: { type: String, default: "" },
    contentTypes: { type: [String], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
