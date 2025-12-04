require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const aiRoutes = require("./routes/aiRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();

// Middlewares to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect Database
connectDB();

// Middleware
app.use(express.json());

// Static folders for uploads
app.use("/backend/uploads", express.static(path.join(__dirname, "uploads")));

// Routes here (API ONLY)
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message || "Server error",
    });
  }

  next();
});


// -------------------------------------------------------------
// ⚡ SERVE FRONTEND BUILD (Vite)
// -------------------------------------------------------------

// Path: backend/public (where Render copies the frontend/dist)
const publicPath = path.join(__dirname, "public");

// If the folder exists, serve static files + enable SPA fallback
if (fs.existsSync(publicPath)) {
  console.log("Serving frontend from:", publicPath);

  // Serve static assets
  app.use(express.static(publicPath));

  // SPA fallback — return index.html for any non-API route
  // Use '/*' pattern to avoid path-to-regexp issues with '*'
  app.get("/*", (req, res) => {
    // Prevent API routes from being hijacked
    if (req.path.startsWith("/api")) return res.status(404).json({ message: "API route not found" });

    res.sendFile(path.join(publicPath, "index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send(err);
      }
    });
  });
} else {
  console.log("⚠ Frontend build folder not found. Showing API root.");
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}


// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
