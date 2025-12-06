let Pool;
try {
	// try to require pg; if missing we show a clear instruction
	Pool = require('pg').Pool;
} catch (err) {
	console.error('❌ Missing dependency: "pg" is not installed.');
	console.error('Run in the backend folder:');
	console.error('  npm install pg');
	console.error('Then restart the server (npm run dev).');
	// exit so nodemon stops with a clear message
	process.exit(1);
}

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  console.error('Connection string (masked):', process.env.DATABASE_URL?.replace(/:[^@]+@/, ':****@'));
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL!');
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Initial connection test failed:', err.message);
  } else {
    console.log('✅ Database connection test successful at:', res.rows[0].now);
  }
});

module.exports = pool;
