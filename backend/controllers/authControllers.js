const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const db = require('../config/db');

// Default profile picture URL
const DEFAULT_PROFILE_PICTURE = 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png';

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check existing user
    const checkSql = 'SELECT user_id FROM users WHERE email = $1 OR username = $2 LIMIT 1';
    const checkRes = await db.query(checkSql, [email, username]);
    if (checkRes.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const insertSql = 'INSERT INTO users (username, email, password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING user_id';
    const insertRes = await db.query(insertSql, [username, email, hashedPassword, DEFAULT_PROFILE_PICTURE]);

    const userId = insertRes.rows[0].user_id;

    // Generate JWT for auto-login
    const token = jwt.sign(
      { userId: userId, username: username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      userId,
      username,
      profile_picture: DEFAULT_PROFILE_PICTURE
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('\n========== LOGIN ATTEMPT ==========');
    console.log('📝 Received:', { username, passwordLength: password?.length });

    if (!username || !password) {
      console.log('❌ VALIDATION FAILED: Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    console.log('✅ Validation passed');
    console.log('🔌 Attempting database connection...');

    const query = 'SELECT user_id, username, email, password, profile_picture FROM users WHERE username = $1 OR email = $2 LIMIT 1';
    console.log('🔍 Executing query:', query);
    console.log('📌 With parameters:', [username, username]);

    const result = await db.query(query, [username, username]);
    const users = result.rows;

    console.log(`📊 Query result: Found ${users.length} user(s)`);
    
    if (users.length === 0) {
      console.log(`❌ DATABASE: User '${username}' not found`);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    console.log(`✅ User found in database: ${user.username}`);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔑 Password valid: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log(`❌ PASSWORD MISMATCH for user '${username}'`);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log(`✅ LOGIN SUCCESSFUL for user: ${user.username}`);
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      userId: user.user_id,
      profile_picture: user.profile_picture,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};