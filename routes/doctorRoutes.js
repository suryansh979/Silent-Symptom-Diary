const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getPatientTrends,
  getMyPatients,
} = require("../controllers/doctorController");

router.get("/patients", protect, authorize("doctor"), getMyPatients);
router.get(
  "/patients/:patientId/trends",
  protect,
  authorize("doctor"),
  getPatientTrends,
);

module.exports = router;
