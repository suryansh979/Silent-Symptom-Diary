const Measurement = require('../models/Measurement');
const { analyzeWithML } = require('../services/mlService');

// Helper Function: 7-day average calculate karne ke liye (The Baseline)
const calculatePatientBaseline = async (patientId) => {
    // Database se patient ke aakhri 7 records nikalna
    const recentMeasurements = await Measurement.find({ patientId: patientId })
        .sort({ createdAt: -1 })
        .limit(7);

    // Agar patient naya hai (Day 1)
    if (recentMeasurements.length === 0) {
        return null; 
    }

    let totalSpeechRate = 0;
    let totalPauseCount = 0;
    let totalTypingSpeed = 0;
    let totalTremor = 0;

    // Sabhi 7 dino ke numbers ko add karna
    recentMeasurements.forEach(record => {
        totalSpeechRate += record.features.voice.speech_rate;
        totalPauseCount += record.features.voice.pause_count;
        totalTypingSpeed += record.features.typing.typing_speed;
        totalTremor += record.features.motion.tremor_amplitude;
    });

    const count = recentMeasurements.length;

    // Average nikal kar return karna
    return {
        speech_rate_avg: totalSpeechRate / count,
        pause_count_avg: totalPauseCount / count,
        typing_speed_avg: totalTypingSpeed / count,
        tremor_amplitude_avg: totalTremor / count
    };
};


// Main Controller Function: Jo Route se connect hoga
const saveDailyMeasurement = async (req, res) => {
    try {
        const { measurements } = req.body;
        
        // Token se verified Patient ID nikalna (Security)
        const verifiedPatientId = req.user.id; 

        if (!measurements) {
            return res.status(400).json({ success: false, message: "Missing data!" });
        }

        // 1. Aaj ka data save karne se pehle, pichle 7 din ka baseline nikalo
        const patientBaseline = await calculatePatientBaseline(verifiedPatientId);

        // 2. Database mein aaj ka naya raw data save karo
        let newMeasurement = new Measurement({
            patientId: verifiedPatientId,
            features: measurements
        });
        await newMeasurement.save(); 

        // 3. Python ML ko bhejne ke liye exact API JSON format taiyaar karo
        const mlPayload = {
            patient_id: verifiedPatientId,
            // Agar baseline null hai (Day 1), toh aaj ke data ko hi baseline maan lo temporary
            baseline: patientBaseline || {
                speech_rate_avg: measurements.voice.speech_rate,
                pause_count_avg: measurements.voice.pause_count,
                typing_speed_avg: measurements.typing.typing_speed,
                tremor_amplitude_avg: measurements.motion.tremor_amplitude
            }, 
            today: {
                speech_rate: measurements.voice.speech_rate,
                pause_count: measurements.voice.pause_count,
                typing_speed: measurements.typing.typing_speed,
                tremor_amplitude: measurements.motion.tremor_amplitude
            }
        };

        // 4. ML Service (Messenger) ko data bhejo
        const mlResult = await analyzeWithML(mlPayload);

        // 5. Agar Python ne result diya, toh wapas Database record ko update karo
        if (mlResult) {
            newMeasurement.ml_analysis = {
                status: 'completed',
                deviation_detected: mlResult.deviation_detected, 
                risk_level: mlResult.risk_level,                 
                notes: mlResult.notes
            };
            await newMeasurement.save(); 
        }

        // 6. Frontend ko final success bhej do
        res.status(201).json({
            success: true,
            message: "Data saved and analyzed!",
            analysis: newMeasurement.ml_analysis
        });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

module.exports = { 
    saveDailyMeasurement,
    calculatePatientBaseline // Isko export kiya taaki testing ya future APIs mein use kar sakein
};