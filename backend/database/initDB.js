const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true
});

const sql = fs.readFileSync(__dirname + "/schema.sql", "utf-8");

db.query(sql, (err, result) => {
  if (err) {
    console.error("Error running schema.sql:", err);
  } else {
    console.log("Database and tables created successfully!");
  }
  db.end();
});