const User = require('../models/User');
const { calculatePatientBaseline } = require('./symptomController'); 

const updateConsent = async (req, res) => {
    try {
        const patientId = req.user.id; 
        const { consent } = req.body; 

        if (consent !== true) {
            return res.status(400).json({ success: false, message: "You must accept the terms to proceed." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            patientId,
            { consentGiven: true },
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        res.status(200).json({
            success: true,
            message: "Consent successfully recorded.",
            consentGiven: updatedUser.consentGiven
        });

    } catch (error) {
        console.error("Consent Error:", error);
        res.status(500).json({ success: false, message: "Server error while recording consent." });
    }
};

const getPatientProfile = async (req, res) => {
    try {
        const patientId = req.user.id;

        const user = await User.findById(patientId).select('-password -__v');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const baseline = await calculatePatientBaseline(patientId);

        res.status(200).json({
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                role: user.role,
                consentGiven: user.consentGiven,
                joinedAt: user.createdAt
            },
            baseline: baseline || { message: "No data submitted yet." } 
        });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching profile." });
    }
};

// Exporting BOTH functions prevents the undefined import error
module.exports = { 
    updateConsent, 
    getPatientProfile 
};