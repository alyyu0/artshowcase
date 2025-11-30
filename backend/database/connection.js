const mysql = require('mysql2/promise');

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('MySQL Connected successfully to art_showcase');
    return connection;
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

module.exports = { createConnection };