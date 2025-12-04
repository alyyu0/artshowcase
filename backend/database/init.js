const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

// Run schema first
const schema = fs.readFileSync('./database/schema.sql', 'utf8');
connection.query(schema, (err, results) => {
  if (err) {
    console.error('❌ Error creating schema:', err.message);
    process.exit(1);
  }
  console.log('✅ Database schema created!');
  
  // Then run seed data
  const seed = fs.readFileSync('./database/sample_data.sql', 'utf8');
  connection.query(seed, (err, results) => {
    if (err) {
      console.error('❌ Error inserting sample data:', err.message);
      process.exit(1);
    }
    console.log('✅ Sample data inserted successfully!');
    connection.end();
    process.exit(0);
  });
});
