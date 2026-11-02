const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { updateConsent, getPatientProfile } = require('../controllers/patientController');

router.post('/consent', protect, authorize('patient'), updateConsent);
router.get('/profile', protect, authorize('patient'), getPatientProfile);

module.exports = router;