const express = require("express");

const router = express.Router();

const {
  markAttendance,
  checkoutAttendance,
  getMyAttendance,
  getAllAttendance,
  verifyAttendance,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

// Punch In
router.post(
  "/mark",
  authMiddleware,
  markAttendance
);

// Punch Out
router.post(
  "/checkout",
  authMiddleware,
  checkoutAttendance
);

// My Attendance
router.get(
  "/my",
  authMiddleware,
  getMyAttendance
);

// ==========================================
// ADMIN / MANAGER ROUTES
// ==========================================

// Get ALL attendance records
router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllAttendance
);

// Verify attendance
router.patch(
  "/:id/verify",
  authMiddleware,
  adminMiddleware,
  verifyAttendance
);

module.exports = router;