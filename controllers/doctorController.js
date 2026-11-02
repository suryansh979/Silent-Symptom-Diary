const Measurement = require('../models/Measurement');
const User = require('../models/User');

const getPatientTrends = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const trends = await Measurement.find({ patientId: patientId })
            .sort({ createdAt: 1 }); 

        if (trends.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "No data available for this patient yet.", 
                data: [] 
            });
        }

        res.status(200).json({
            success: true,
            patientName: patient.name,
            count: trends.length,
            data: trends
        });

    } catch (error) {
        console.error("Trends API Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching trends." });
    }
};

const getMyPatients = async (req, res) => {
    try {
        const doctorId = req.user.id; 

        const patients = await User.find({ 
            role: 'patient', 
            assignedDoctor: doctorId 
        }).select('-password -__v'); 

        if (patients.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "No patients assigned yet.",
                count: 0,
                data: [] 
            });
        }

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });

    } catch (error) {
        console.error("Fetch Patients Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching patients." });
    }
};

// Exporting BOTH functions prevents the undefined handler TypeError
module.exports = { 
    getPatientTrends,
    getMyPatients 
};