const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("[FATAL] MONGO_URI is missing from environment variables!");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[INFO] MongoDB Connected successfully");
  } catch (error) {
    console.error("[DB Error] Connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;