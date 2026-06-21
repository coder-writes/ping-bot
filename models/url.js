import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    healthUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    host: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    createdFromIp: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastPingedAt: {
      type: Date,
      default: null,
    },
    lastHealthyAt: {
      type: Date,
      default: null,
    },
    lastStatusCode: {
      type: Number,
      default: null,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
    pingIntervalMinutes: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("RenderUrl", urlSchema);
