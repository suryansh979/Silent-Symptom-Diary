const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    // 1. Patient Reference: Ties this record to the logged-in user
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    
    // 2. High-Level Metrics: Defaults to 0 so skipped tests don't crash the database
    tremor: { type: Number, default: 0 },
    speech: { type: Number, default: 0 },
    typing: { type: Number, default: 0 },
    
    // 3. Nested Details: Matches the exact 'details' object sent by your frontend
    details: {
      speech_duration_seconds: { type: Number, default: 0 },
      pause_count: { type: Number, default: 0 },
      typing_speed: { type: Number, default: 0 },
      key_hold_time_avg_ms: { type: Number, default: 0 },
      typing_errors: { type: Number, default: 0 },
      motion_variability: { type: Number, default: 0 }
    },

    // 4. Machine Learning Results
    riskScore: { type: Number, default: 0 }, // The dynamic average from Python
    mlFlag: { type: String, default: "stable" }, // e.g., "stable" or "higher" for the UI
    testsAnalyzed: { type: Number, default: 0 }, // Tracks how many ML modules ran (0-3)

    // 5. Frontend Timestamp (Optional backup to Mongoose's timestamps)
    savedAt: { type: Date }
  },
  // Automatically creates 'createdAt' and 'updatedAt' timestamps
  { timestamps: true } 
);

module.exports = mongoose.model("Measurement", measurementSchema);