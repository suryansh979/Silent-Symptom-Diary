const express = require('express');
const router = express.Router();
const { protect, authorize, requireConsent } = require('../middleware/authMiddleware');
const { saveDailyMeasurement } = require('../controllers/symptomController');

// The Ultimate Secure Route:
// 1. protect -> Are they logged in?
// 2. authorize -> Are they a patient?
// 3. requireConsent -> Did they sign the digital agreement?
// 4. saveDailyMeasurement -> Save the data!
router.post('/measurements', protect, authorize('patient'), requireConsent, saveDailyMeasurement);

module.exports = router;