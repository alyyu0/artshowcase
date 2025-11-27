const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const followRoutes = require("./routes/followRoutes");
const saveRoutes = require("./routes/saveRoutes");

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/artwork", artworkRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/saves", saveRoutes);

app.get("/api/status", (req, res) => {
  res.json({ status: "Backend API is working!", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));