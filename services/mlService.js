const axios = require('axios');

const getPrediction = async (patientData) => {
    
    const baseUrl = process.env.ML_API_URL; 
    
    // Array to hold our concurrent API calls
    const mlRequests = [];

    // 1. Route Voice Data
    if (patientData.speech > 0) {
        // Replace with the exact JSON keys the /predict/voice endpoint expects
        const voicePayload = { speech_features: patientData.speech }; 
        
        const voiceReq = axios.post(`${baseUrl}/predict/voice`, voicePayload)
            .then(res => ({ type: 'voice', score: res.data.prediction || 0 }))
            .catch(err => {
                console.error("Voice ML failed:", err.message);
                return { type: 'voice', score: 0 };
            });
            
        mlRequests.push(voiceReq);
    }

    // 2. Route Rest Tremor Data
    if (patientData.tremor > 0) {
        // Replace with the exact JSON keys the /predict/motion/rest endpoint expects
        const tremorPayload = { tremor_features: patientData.tremor };
        
        const tremorReq = axios.post(`${baseUrl}/predict/motion/rest`, tremorPayload)
            .then(res => ({ type: 'tremor', score: res.data.prediction || 0 }))
            .catch(err => {
                console.error("Tremor ML failed:", err.message);
                return { type: 'tremor', score: 0 };
            });
            
        mlRequests.push(tremorReq);
    }

    // 3. Execute all ML calls simultaneously
    // Promise.all ensures Node.js doesn't wait for Voice to finish before starting Tremor
    const results = await Promise.all(mlRequests);

    // 4. Calculate Dynamic Average
    let totalRisk = 0;
    let successfulTests = 0;

    results.forEach(result => {
        if (result.score > 0) {
            totalRisk += result.score;
            successfulTests += 1;
        }
    });

    const finalRiskScore = successfulTests > 0 ? (totalRisk / successfulTests) : 0;

    return {
        prediction: finalRiskScore,
        label: finalRiskScore > 0.60 ? "Parkinson's pattern" : "Healthy control pattern"
    };
};

module.exports = { getPrediction };