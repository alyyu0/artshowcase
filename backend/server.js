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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Database: Supabase PostgreSQL`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});