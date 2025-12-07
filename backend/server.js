const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const saveRoutes = require('./routes/saveRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const debugController = require('./controllers/debugController');
const db = require('./config/db');

const app = express();

// Allow frontend dev origins (Vite default 5173 and CRA 3000) or override via FRONTEND_ORIGIN env
const frontendOrigin = process.env.FRONTEND_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/artwork', artworkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/leaderboard', leaderboardRoutes);


app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/api/health', async (req, res) => {
  try {
    // simple query to verify DB connection and counts
    const dbRes = await db.query('SELECT 1');
    const usersCountRes = await db.query('SELECT COUNT(*)::int AS count FROM users');
    const artworkCountRes = await db.query('SELECT COUNT(*)::int AS count FROM artwork');

    // try to parse host from DATABASE_URL (if present)
    let dbHost = null;
    try {
      if (process.env.DATABASE_URL) {
        const parsed = new URL(process.env.DATABASE_URL);
        dbHost = parsed.hostname;
      }
    } catch (err) {
      dbHost = null;
    }

    res.json({
      success: true,
      message: 'Backend and database are connected successfully',
      dbHost,
      users: usersCountRes.rows[0].count,
      artworks: artworkCountRes.rows[0].count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

// Try to start the server on DEFAULT_PORT; if it's in use, try subsequent ports.
const tryStartPort = async (startPort = DEFAULT_PORT, maxAttempts = 10) => {
  let port = startPort;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const srv = app.listen(port, () => {
          console.log(`🚀 Server is running on port ${port}`);
          console.log(`📊 Database: Supabase PostgreSQL`);
          console.log(`🔗 Health check: http://localhost:${port}/api/health`);
          resolve();
        });

        srv.on('error', (err) => {
          // If port in use, reject so we can try next port, otherwise reject and exit
          reject(err);
        });
      });

      // If we reach here, server started successfully
      return;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use. Trying port ${port + 1}...`);
        port += 1;
        // small delay before retrying to avoid tight loop
        await new Promise(r => setTimeout(r, 200));
        continue;
      }
      // Unexpected error - log and exit
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  }

  console.error(`Failed to start server after ${maxAttempts} attempts starting at port ${startPort}.`);
  process.exit(1);
};

tryStartPort().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

// Global handlers for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Debug endpoint: returns follow relationships and feed rows for a given user
app.get('/api/debug/user_feed_check/:user_id', debugController.userFeedDebug);