const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/api/health', async (req, res) => {
  try {
    const { createConnection } = require('./database/connection');
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    
    res.json({ 
      success: true,
      message: 'Backend and database are connected successfully' 
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
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});