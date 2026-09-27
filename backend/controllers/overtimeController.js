const Overtime = require("../models/Overtime");
const Attendance = require("../models/Attendance");

// ==========================================
// Employee - Request Overtime
// ==========================================

const requestOvertime = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const {
      attendanceId,
      date,
      requestedMinutes,
      reason,
    } = req.body;

    if (!attendanceId || !date || !requestedMinutes || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance, date, minutes and reason are required",
      });
    }

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      employee: employeeId,
      date,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (!attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Punch out before requesting overtime",
      });
    }

    const existingRequest = await Overtime.findOne({
      employee: employeeId,
      attendance: attendanceId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "Overtime request already pending",
      });
    }

    const overtime = await Overtime.create({
      employee: employeeId,
      attendance: attendanceId,
      date,
      requestedMinutes,
      reason,
    });

    attendance.overtimeStatus = "pending";
    await attendance.save();

    return res.status(201).json({
      success: true,
      message: "Overtime request submitted",
      overtime,
    });
  } catch (error) {
    console.error("Request Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while requesting overtime",
      error: error.message,
    });
  }
};

// ==========================================
// Employee - My Overtime
// ==========================================

const getMyOvertime = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const overtime = await Overtime.find({
      employee: employeeId,
    })
      .populate("attendance")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      overtime,
    });
  } catch (error) {
    console.error("Get My Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching overtime",
      error: error.message,
    });
  }
};

// ==========================================
// Admin / Manager - Pending Requests
// ==========================================

const getPendingOvertime = async (req, res) => {
  try {
    const overtime = await Overtime.find({
      status: "pending",
    })
      .populate("employee", "name email role")
      .populate("attendance")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      overtime,
    });
  } catch (error) {
    console.error("Pending Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending overtime",
      error: error.message,
    });
  }
};

// ==========================================
// Admin / Manager - Approve / Reject
// ==========================================

const updateOvertimeStatus = async (req, res) => {
  try {
    const reviewerId = req.user.id;

    const { id } = req.params;
    const { status, remarks = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const overtime = await Overtime.findById(id);

    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found",
      });
    }

    if (overtime.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Overtime request already processed",
      });
    }

    overtime.status = status;
    overtime.reviewedBy = reviewerId;
    overtime.remarks = remarks;

    await overtime.save();

    const attendance = await Attendance.findById(
      overtime.attendance
    );

    if (attendance) {
      attendance.overtimeStatus = status;

      if (status === "approved") {
        attendance.overtimeMinutes =
          overtime.requestedMinutes;
      } else {
        attendance.overtimeMinutes = 0;
      }

      attendance.overtimeRemarks = remarks;

      await attendance.save();
    }

    return res.status(200).json({
      success: true,
      message: `Overtime ${status} successfully`,
      overtime,
    });
  } catch (error) {
    console.error("Update Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating overtime",
      error: error.message,
    });
  }
};

module.exports = {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  updateOvertimeStatus,
};