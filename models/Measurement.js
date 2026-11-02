const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    features: {
      voice: {
        speech_rate: { type: Number },
        pause_count: { type: Number },
      },
      typing: {
        typing_speed: { type: Number },
        key_hold_time_avg: { type: Number },
      },
      motion: {
        tremor_amplitude: { type: Number },
      },
    },

    ml_analysis: {
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      deviation_detected: { type: Boolean, default: false },
      risk_level: { type: String },
      notes: { type: String },
    },

    isBaselineData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Measurement", measurementSchema);
