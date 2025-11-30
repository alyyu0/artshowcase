const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

const sql = fs.readFileSync('./database/setup.sql', 'utf8');

connection.query(sql, (err, results) => {
  if (err) {
    console.error('❌ Error running setup:', err.message);
    process.exit(1);
  }
  console.log('✅ Database setup complete!');
  console.log('✅ All tables created successfully');
  connection.end();
  process.exit(0);
});