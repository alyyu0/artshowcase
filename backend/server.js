const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");

app.use(express.json());

// Test route
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS solution", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
