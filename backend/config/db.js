const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables. Please set it in your .env file or Render dashboard."
      );
    }

    console.log("🔌 Connecting to MongoDB Atlas...");

    // Add serverSelectionTimeoutMS to prevent hanging indefinitely
    await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 15000, // 15 second timeout
      connectTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Atlas connected successfully");
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("\nTroubleshooting steps:");
    console.error("1. Verify MONGODB_URI is set correctly in .env");
    console.error("2. Check if MongoDB Atlas cluster is running");
    console.error("3. Ensure your IP is whitelisted in MongoDB Atlas (Network Access)");
    console.error("4. Try adding 0.0.0.0/0 to IP whitelist for testing");
    throw error;
  }
};

module.exports = connectDB;
