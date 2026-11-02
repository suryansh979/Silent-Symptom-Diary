// backend/services/mlService.js
const axios = require('axios');

// Yeh function hamara messenger hai jo Python ko data dega
const analyzeWithML = async (features) => {
    try {
        // FastAPI ka default address aur '/predict' endpoint
        const pythonApiUrl = 'http://localhost:8000/predict'; 
        
        // Node.js is acting like a client sending data to Python
        const response = await axios.post(pythonApiUrl, features);
        
        // Python jo result dega (e.g., risk_level), wo hum return kar denge
        return response.data; 

    } catch (error) {
        // Agar ML server band hai (off hai), toh Node.js crash nahi hona chahiye!
        console.error("ML Service Error - Could not reach Python:", error.message);
        
        // Hum null return karenge, taaki backend gracefully handle kar sake
        return null; 
    }
};

module.exports = { analyzeWithML };