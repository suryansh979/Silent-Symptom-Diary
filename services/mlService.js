const axios = require('axios');

const getPrediction = async (patientData) => {
    try {
        // Send data to the live Python ML model
        const response = await axios.post(process.env.ML_API_URL, patientData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Return the prediction result back to your controller
        return response.data;
    } catch (error) {
        console.error("ML Service Error:", error.message);
        // Fallback or error handling if the ML server is asleep or crashes
        throw new Error("Failed to get prediction from ML model");
    }
};

module.exports = { getPrediction };