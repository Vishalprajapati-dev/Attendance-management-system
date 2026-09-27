const express = require("express");
const cors = require("cors");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const overtimeRoutes = require("./routes/overtimeRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
// Authentication Routes
app.use("/api/auth", authRoutes);

// Attendance Routes
app.use(
  "/api/attendance",
  attendanceRoutes
);
// Overtime Routes
app.use("/api/overtime", overtimeRoutes);
// Test route
app.get("/", (req, res) => {
    res.send("Attendance Management System API is running");
});

// Health Check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Attendance Management System Backend is running"
    });
});

module.exports = app;