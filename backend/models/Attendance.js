const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      default: "present",
    },

    // =========================
    // CHECK IN
    // =========================

    checkIn: {
      type: Date,
      default: null,
    },

    checkInSelfie: {
      type: String,
      default: null,
    },

    checkInLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    // =========================
    // CHECK OUT
    // =========================

    checkOut: {
      type: Date,
      default: null,
    },

    checkOutSelfie: {
      type: String,
      default: null,
    },

    checkOutLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    // =========================
    selfie: {
      type: String,
      default: null,
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    // =========================
    // WORKING HOURS
    // =========================

    totalWorkingMinutes: {
      type: Number,
      default: 0,
    },

    workingStatus: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete",
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },

    overtimeStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    overtimeRemarks: {
      type: String,
      default: "",
    },

    // =========================
    // ATTENDANCE VERIFICATION
    // =========================

    attendanceVerification: {
      status: {
        type: String,
        enum: ["pending", "valid", "invalid"],
        default: "pending",
      },

      remarks: {
        type: String,
        default: "",
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

// One attendance record per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
