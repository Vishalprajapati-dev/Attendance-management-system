require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const EMAIL = "vishaltest@example.com";
const NEW_PASSWORD = "Vishal@123";

async function resetPassword() {
  try {
    // IMPORTANT:
    // Use the SAME variable that server.js uses.
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MongoDB connection variable not found in .env");
    }

    await mongoose.connect(mongoUrl);

    console.log("MongoDB connected");
    console.log("Database:", mongoose.connection.name);

    // Show all users so we can confirm correct database
    const users = await User.find({}).select("name email role");

    console.log("\nUsers found in this database:");

    if (users.length === 0) {
      console.log("❌ NO USERS FOUND");
      console.log("This is NOT the database containing your users.");
      await mongoose.disconnect();
      return;
    }

    users.forEach((user) => {
      console.log(
        `- ${user.name} | ${user.email} | ${user.role}`
      );
    });

    const user = await User.findOne({
      email: EMAIL.toLowerCase().trim(),
    });

    if (!user) {
      console.log(`\n❌ User not found: ${EMAIL}`);
      await mongoose.disconnect();
      return;
    }

    user.password = NEW_PASSWORD;

    await user.save();

    console.log("\n================================");
    console.log("✅ PASSWORD RESET SUCCESSFUL");
    console.log("Email:", user.email);
    console.log("Password:", NEW_PASSWORD);
    console.log("Role:", user.role);
    console.log("================================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
  }
}

resetPassword();