const express = require('express');
const router = express.Router();

// Import the security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the controller functions we just created
const { 
    addDailyMeasurement, 
    getPatientMeasurements 
} = require('../controllers/symptomController');

// POST /api/measurements -> Log a new symptom (Triggers ML model)
router.post('/', protect, authorize('patient'), addDailyMeasurement);

// GET /api/measurements -> View personal measurement history
router.get('/', protect, authorize('patient'), getPatientMeasurements);

module.exports = router;