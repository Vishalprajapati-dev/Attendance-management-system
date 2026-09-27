const express = require("express");

const router = express.Router();

const {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  updateOvertimeStatus,
} = require("../controllers/overtimeController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Employee
router.post(
  "/request",
  authMiddleware,
  requestOvertime
);

router.get(
  "/my",
  authMiddleware,
  getMyOvertime
);

// Admin
router.get(
  "/pending",
  authMiddleware,
  adminMiddleware,
  getPendingOvertime
);

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOvertimeStatus
);

module.exports = router;