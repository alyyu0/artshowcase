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
    console.log('\n=== 📝 SIGNUP ATTEMPT STARTED ===');
    console.log('📥 Request body:', JSON.stringify(req.body));
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      console.log(`❌ Password too short: ${password.length} chars`);
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log(`🔌 Connecting to database for signup...`);
    connection = await createConnection();
    console.log('✅ Database connected');

    console.log(`🔍 Checking if user exists: ${username} / ${email}`);
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      console.log(`❌ User already exists: ${existingUsers[0].username}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`🔐 Password hashed: ${hashedPassword.substring(0, 30)}...`);

    console.log('💾 Inserting new user into database...');
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, profile_picture) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, DEFAULT_PROFILE_PICTURE]
    );

    const userId = result.insertId;
    console.log(`✅ User created with ID: ${userId}`);

    console.log('🎭 Creating JWT token...');
    const token = jwt.sign(
      { userId: userId, username: username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log(`✅ SIGNUP SUCCESSFUL for: ${username}`);
    console.log('=== ✅ SIGNUP COMPLETED ===\n');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      userId,
      username,
      profile_picture: DEFAULT_PROFILE_PICTURE
    });

  } catch (error) {
    console.error('🔥 SIGNUP ERROR:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Login controller
exports.login = async (req, res) => {
  let connection;
  try {
    console.log('\n=== 🔐 LOGIN ATTEMPT STARTED ===');
    console.log('📥 Request body:', JSON.stringify(req.body));
    console.log('🕐 Time:', new Date().toISOString());
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    console.log(`🔑 Login attempt for: "${username}"`);
    console.log(`🔑 Password provided (length): ${password ? password.length : 0} characters`);

    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    console.log('✅ Database connected successfully');

    console.log(`🔍 Executing SQL query for: "${username}"`);
    
    const [users] = await connection.execute(
      'SELECT user_id, username, email, password, profile_picture FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    console.log(`📊 Database query results: Found ${users.length} user(s)`);

    if (users.length === 0) {
      console.log(`❌ NO USER FOUND with username/email: "${username}"`);
      console.log('💡 Possible issues:');
      console.log('   - User doesn\'t exist in database');
      console.log('   - Typo in username/email');
      console.log('   - Different database/schema');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    console.log(`👤 USER FOUND:`);
    console.log(`   ID: ${user.user_id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Profile Pic: ${user.profile_picture}`);
    console.log(`   Password Hash: ${user.password.substring(0, 30)}...`);

    console.log(`🔐 Comparing password...`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password comparison: ${isPasswordValid ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);
    
    if (!isPasswordValid) {
      console.log(`❌ INCORRECT PASSWORD for user: ${user.username}`);
      console.log('💡 The password hash in database was created with a different password');
      console.log('💡 Try registering a new user or use password "password123" for test users');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('🎭 Creating JWT token...');
    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log(`✅ LOGIN SUCCESSFUL for: ${user.username}`);
    console.log(`✅ Token generated: ${token.substring(0, 30)}...`);
    console.log('=== ✅ LOGIN COMPLETED ===\n');

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
    console.error('🔥 LOGIN ERROR:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Test function to check database users
exports.testUsers = async (req, res) => {
  let connection;
  try {
    console.log('\n=== 🧪 TESTING DATABASE CONNECTION ===');
    connection = await createConnection();
    
    const [users] = await connection.execute('SELECT user_id, username, email FROM users LIMIT 10');
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log(`📊 Found ${users.length} users`);
    console.log(`📊 Found ${tables.length} tables`);
    
    res.json({
      success: true,
      usersCount: users.length,
      users: users,
      tables: tables.map(t => Object.values(t)[0])
    });
    
  } catch (error) {
    console.error('🔥 TEST ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};