const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Protected Test Route
router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You have access to the protected route",
    user: req.user,
  });
});

module.exports = router;
