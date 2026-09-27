require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;

const createDefaultUsers = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    // ==================================================
    // ADMIN ACCOUNT
    // ==================================================

    const adminEmail = "admin@attendance.com";
    const adminPassword = "Admin@123";

    let admin = await User.findOne({
      email: adminEmail,
    });

    if (!admin) {
      admin = new User({
        name: "System Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });

      await admin.save();

      console.log("✅ Admin account created");
    } else {
      admin.name = "System Admin";
      admin.password = adminPassword;
      admin.role = "admin";

      await admin.save();

      console.log("✅ Admin account updated");
    }


    // ==================================================
    // EMPLOYEE ACCOUNT
    // ==================================================

    const employeeEmail = "employee@attendance.com";
    const employeePassword = "Employee@123";

    let employee = await User.findOne({
      email: employeeEmail,
    });

    if (!employee) {
      employee = new User({
        name: "Test Employee",
        email: employeeEmail,
        password: employeePassword,
        role: "employee",
      });

      await employee.save();

      console.log("✅ Employee account created");
    } else {
      employee.name = "Test Employee";
      employee.password = employeePassword;
      employee.role = "employee";

      await employee.save();

      console.log("✅ Employee account updated");
    }


    // ==================================================
    // LOGIN DETAILS
    // ==================================================

    console.log("\n====================================");
    console.log("      DEFAULT LOGIN ACCOUNTS");
    console.log("====================================");

    console.log("\nADMIN");
    console.log("Email    :", adminEmail);
    console.log("Password :", adminPassword);
    console.log("Role     : admin");

    console.log("\nEMPLOYEE");
    console.log("Email    :", employeeEmail);
    console.log("Password :", employeePassword);
    console.log("Role     : employee");

    console.log("\n====================================\n");

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

createDefaultUsers();