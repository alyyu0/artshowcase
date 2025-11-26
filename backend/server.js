const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS solution", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


// New static JSON endpoint
app.get("/api/status", (req, res) => {
  res.json({ status: "Backend API is working!", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));