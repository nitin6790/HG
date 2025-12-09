require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🏢 HSGI Inventory Backend API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/warehouses", require("./routes/warehouses"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/items", require("./routes/items"));

// Database connection test route
app.get("/test-db", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    message: "✅ DB connection working",
    dbName: mongoose.connection.name,
    dbState: mongoose.connection.readyState,
    connected: mongoose.connection.readyState === 1,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on ${HOST}:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ Ready to accept requests`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

module.exports = app;
