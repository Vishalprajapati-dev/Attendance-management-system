const Attendance = require("../models/Attendance");

// ==========================================
// Helper Functions
// ==========================================

const isValidDateFormat = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

const isValidLocation = (location) => {
  return (
    location &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};

// ==========================================
// MARK ATTENDANCE / PUNCH IN
// ==========================================

const markAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const { date, status = "present", selfie, location } = req.body;

    // -------------------------
    // Validate date
    // -------------------------

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    // -------------------------
    // Validate status
    // -------------------------

    const allowedStatuses = ["present", "absent", "late", "leave"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status",
      });
    }

    // -------------------------
    // Selfie required
    // -------------------------

    if (!selfie) {
      return res.status(400).json({
        success: false,
        message: "Live selfie is required",
      });
    }

    // -------------------------
    // Location required
    // -------------------------

    if (!isValidLocation(location)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    // -------------------------
    // Check existing attendance
    // -------------------------

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    // -------------------------
    // Create attendance
    // -------------------------

    const attendance = await Attendance.create({
      employee: employeeId,
      date,
      status,

      checkIn: status === "present" || status === "late" ? new Date() : null,

      checkInSelfie: status === "present" || status === "late" ? selfie : null,

      checkInLocation:
        status === "present" || status === "late"
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : {
              latitude: null,
              longitude: null,
            },
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY ATTENDANCE
// ==========================================

const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const attendance = await Attendance.find({
      employee: employeeId,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance",
      error: error.message,
    });
  }
};

// ==========================================
// CHECK OUT / PUNCH OUT
// ==========================================

const checkoutAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const { date, selfie, location } = req.body;

    // -------------------------
    // Validate date
    // -------------------------

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    // -------------------------
    // Validate selfie
    // -------------------------

    if (!selfie) {
      return res.status(400).json({
        success: false,
        message: "Live selfie is required for checkout",
      });
    }

    // -------------------------
    // Validate location
    // -------------------------

    if (!isValidLocation(location)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    // -------------------------
    // Find attendance
    // -------------------------

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No attendance found for this date",
      });
    }

    // -------------------------
    // Already checked out
    // -------------------------

    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message: "Attendance already checked out",
      });
    }

    // -------------------------
    // Update checkout
    // -------------------------

    const checkOutTime = new Date();

    attendance.checkOut = checkOutTime;

    attendance.checkOutSelfie = selfie;

    attendance.checkOutLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    // -------------------------
    // Calculate working hours
    // -------------------------

    const workingMilliseconds =
      checkOutTime.getTime() - attendance.checkIn.getTime();

    const workingMinutes = Math.max(
      0,
      Math.floor(workingMilliseconds / (1000 * 60)),
    );

    attendance.totalWorkingMinutes = workingMinutes;

    // 8 hours = 480 minutes
    attendance.workingStatus =
      workingMinutes >= 480 ? "completed" : "incomplete";
    attendance.overtimeMinutes = Math.max(0, workingMinutes - 480);

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Checkout successful",
      attendance,
    });
  } catch (error) {
    console.error("Checkout Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while checking out",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN / MANAGER - GET ALL ATTENDANCE
// ==========================================

const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("employee", "name email role")
      .populate("attendanceVerification.verifiedBy", "name email")
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get All Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN / MANAGER - VERIFY ATTENDANCE
// ==========================================

const verifyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks = "" } = req.body;

    if (!["valid", "invalid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be valid or invalid",
      });
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    attendance.attendanceVerification = {
      status,
      remarks: remarks.trim(),
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    };

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: `Attendance marked as ${status}`,
      attendance,
    });
  } catch (error) {
    console.error("Verify Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying attendance",
      error: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  checkoutAttendance,
  getMyAttendance,
  getAllAttendance,
  verifyAttendance,
};
