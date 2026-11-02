const Measurement = require('../models/Measurement');
const { getPrediction } = require('../services/mlService');

// 1. Add a new daily measurement & trigger ML analysis
const addDailyMeasurement = async (req, res) => {
    try {
        const patientId = req.user.id;
        const patientData = req.body;

        // Wrap the ML call in its own try/catch so the server doesn't crash 
        // if the Python ML model is temporarily asleep on Render
        let mlAnalysis = { risk_score: null, needs_doctor: false };
        try {
            mlAnalysis = await getPrediction(patientData);
        } catch (mlError) {
            console.error("ML Server unreachable. Saving measurement without ML flags.");
        }

        // Save the patient's data plus the ML model's conclusions to MongoDB
        const newMeasurement = await Measurement.create({
            patientId,
            ...patientData,
            riskScore: mlAnalysis.risk_score, // Ensure these keys match what the Python dev sends
            mlFlag: mlAnalysis.needs_doctor 
        });

        res.status(201).json({
            success: true,
            message: "Measurement logged successfully",
            data: newMeasurement
        });

    } catch (error) {
        console.error("Measurement Entry Error:", error);
        res.status(500).json({ success: false, message: "Server error while saving measurement" });
    }
};

// 2. Fetch all previous measurements for the logged-in patient
const getPatientMeasurements = async (req, res) => {
    try {
        const patientId = req.user.id;
        
        // Fetch and sort by newest first (-1)
        const measurements = await Measurement.find({ patientId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: measurements.length,
            data: measurements
        });
    } catch (error) {
        console.error("Fetch Measurements Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching history" });
    }
};

// 3. Helper function used by patientController.js to generate profile dashboard stats
const calculatePatientBaseline = async (patientId) => {
    try {
        // Grab the patient's first 5 entries to establish their "normal" baseline
        const measurements = await Measurement.find({ patientId }).sort({ createdAt: 1 }).limit(5);
        
        if (measurements.length === 0) {
            return null;
        }

        return {
            status: "Baseline Active",
            entriesUsed: measurements.length,
            trackingSince: measurements[0].createdAt
        };
    } catch (error) {
        console.error("Baseline Calculation Error:", error);
        return null;
    }
};

module.exports = {
    addDailyMeasurement,
    getPatientMeasurements,
    calculatePatientBaseline
};