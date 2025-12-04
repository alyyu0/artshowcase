const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { createConnection } = require('../database/connection');

// Default profile picture URL
const DEFAULT_PROFILE_PICTURE = 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png';

// Signup controller
exports.signup = async (req, res) => {
  let connection;
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

    connection = await createConnection();

    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, profile_picture) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, DEFAULT_PROFILE_PICTURE]
    );

    const userId = result.insertId;

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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Login controller
exports.login = async (req, res) => {
  let connection;
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

    connection = await createConnection();
    console.log('✅ Database connection successful');

    const query = 'SELECT user_id, username, email, password, profile_picture FROM users WHERE username = ? OR email = ?';
    console.log('🔍 Executing query:', query);
    console.log('📌 With parameters:', [username, username]);

    const [users] = await connection.execute(query, [username, username]);

    console.log(`📊 Query result: Found ${users.length} user(s)`);
    
    if (users.length === 0) {
      console.log(`❌ DATABASE: User '${username}' not found`);
      console.log('💡 Debugging tips:');
      console.log('   - Check if sample_data.sql was run');
      console.log('   - Check if users table has data: SELECT COUNT(*) FROM users;');
      console.log('   - Try logging in with a sample user like "cr4n3w1v3sf4n"');
      
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    console.log(`✅ User found in database:`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - User ID: ${user.user_id}`);
    console.log(`   - Hash preview: ${user.password.substring(0, 25)}...`);

    console.log('\n🔐 Password verification:');
    console.log(`   - Incoming password length: ${password.length}`);
    console.log(`   - Stored hash length: ${user.password.length}`);
    console.log(`   - Hash starts with: ${user.password.substring(0, 10)}`);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`   - Bcrypt comparison result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log(`\n❌ PASSWORD MISMATCH for user '${username}'`);
      console.log('💡 Possible causes:');
      console.log('   - Wrong password entered');
      console.log('   - Hash is corrupted in database');
      console.log('   - Sample password is not "password"');
      console.log(`   - Try password: "password" (sample data uses this)`);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`\n✅ PASSWORD VALID!`);
    console.log('🎫 Generating JWT token...');

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log(`✅ Token generated successfully`);
    console.log(`✅ LOGIN SUCCESSFUL for user: ${user.username}`);
    console.log('======================================\n');

    res.json({
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
    console.log('\n❌ CAUGHT ERROR:');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('======================================\n');
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    if (connection) {
      console.log('🔌 Closing database connection...');
      await connection.end();
      console.log('✅ Connection closed');
    }
  }
};