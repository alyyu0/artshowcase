const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true, // allows multiple queries in one go
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

// Read the SQL file with sample data
const sql = fs.readFileSync('./database/sample_data.sql', 'utf8');

// Execute SQL queries
connection.query(sql, (err, results) => {
  if (err) {
    console.error('❌ Error inserting sample data:', err.message);
    process.exit(1);
  }
  console.log('✅ Sample data inserted successfully!');
  connection.end();
});
