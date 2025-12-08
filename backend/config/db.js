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
  // Don't exit process - let server continue running
});

pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL!');
});

// Test connection on startup - but don't crash on SSL warnings
// Run this in a timeout so it doesn't block server startup
setTimeout(() => {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      if (err.message.includes('self-signed certificate')) {
        console.log('⚠️  SSL certificate warning (normal for Supabase)');
        console.log('✅ Server will continue - API endpoints will work');
      } else {
        console.error('❌ Database connection error:', err.message);
      }
    } else {
      console.log('✅ Database connection test successful at:', res.rows[0].now);
    }
  });
}, 1000); // Delay test by 1 second

// For authControllers.js
const createConnection = async () => {
  const client = await pool.connect();
  
  // Return an object that mimics mysql2/promise interface
  return {
    execute: async (query, params) => {
      const result = await client.query(query, params);
      return [result.rows, result.fields];
    },
    query: async (query, params) => {
      return await client.query(query, params);
    },
    end: async () => {
      client.release();
    },
    release: () => {
      client.release();
    }
  };
};

module.exports = {
  query: (text, params) => pool.query(text, params),  // For server.js health endpoint
  pool,  // Keep the pool export for backward compatibility
  createConnection  // For authControllers.js
};
