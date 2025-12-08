const bcrypt = require('bcryptjs');  
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { createConnection } = require('../config/db');

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
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      console.log(`❌ Password too short: ${password.length} chars`);
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    console.log('🔌 Connecting to database for signup...');
    connection = await createConnection();
    console.log('✅ Database connected');

    console.log(`🔍 Checking if user exists: ${username} / ${email}`);
    const [existingUsers] = await connection.execute(
      'SELECT user_id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
      [email, username]
    );

    if (existingUsers.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ success: false, message: 'User already exists with this email or username' });
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔐 Password hashed successfully');

    console.log('💾 Inserting new user into database...');
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [username, email, hashedPassword, DEFAULT_PROFILE_PICTURE]
    );

    const userId = result[0].user_id; // PostgreSQL returns array, not insertId
    console.log(`✅ User created with ID: ${userId}`);

    console.log('🎭 Creating JWT token...');
    const token = jwt.sign({ userId: userId, username: username }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    console.log(`✅ SIGNUP SUCCESSFUL for: ${username}`);
    console.log('=== ✅ SIGNUP COMPLETED ===\n');

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      userId,
      username,
      profile_picture: DEFAULT_PROFILE_PICTURE
    });

  } catch (error) {
    console.error('🔥 SIGNUP ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('🔌 Database connection closed');
      } catch (e) {
        console.error('Error closing connection:', e);
      }
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
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    console.log(`🔑 Login attempt for: "${username}"`);
    connection = await createConnection();
    console.log('✅ Database connected successfully');

    const [users] = await connection.execute(
      'SELECT user_id, username, email, password, profile_picture FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, username]
    );

    console.log(`📊 Database query results: Found ${users.length} user(s)`);

    if (users.length === 0) {
      console.log(`❌ NO USER FOUND with username/email: "${username}"`);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    console.log(`👤 USER FOUND: ${user.username}`);

    console.log('🔐 Comparing password...');
    const storedPassword = user.password || '';

    // Determine whether the stored password is a bcrypt hash (starts with $2)
    let isPasswordValid = false;
    try {
      if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
        // Stored password is a bcrypt hash -> compare
        isPasswordValid = await bcrypt.compare(password, storedPassword);
      } else {
        // Stored password appears to be plain text -> compare directly
        if (password === storedPassword) {
          isPasswordValid = true;

          // Re-hash the plain-text password and update the DB for better security
          try {
            const newHash = await bcrypt.hash(password, 12);
            await connection.execute('UPDATE users SET password = $1 WHERE user_id = $2', [newHash, user.user_id]);
            console.log('🔄 Re-hashed and updated plain-text password in DB');
          } catch (updateErr) {
            console.error('⚠️ Failed to re-hash/update stored plain password:', updateErr);
          }
        } else {
          // As a fallback, attempt bcrypt.compare in case of different hash prefix
          try {
            isPasswordValid = await bcrypt.compare(password, storedPassword);
          } catch (cmpErr) {
            isPasswordValid = false;
          }
        }
      }
    } catch (compareError) {
      console.error('Error while comparing password:', compareError);
      isPasswordValid = false;
    }

    console.log(`🔐 Password comparison: ${isPasswordValid ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);

    if (!isPasswordValid) {
      console.log(`❌ INCORRECT PASSWORD for user: ${user.username}`);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('🎭 Creating JWT token...');
    const token = jwt.sign({ userId: user.user_id, username: user.username }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    console.log(`✅ LOGIN SUCCESSFUL for: ${user.username}`);
    console.log('=== ✅ LOGIN COMPLETED ===\n');

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
    console.error('🔥 LOGIN ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('🔌 Database connection closed');
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
};

// Test function to check database users
exports.testUsers = async (req, res) => {
  let connection;
  try {
    console.log('\n=== 🧪 TESTING DATABASE CONNECTION ===');
    connection = await createConnection();

    // Fixed PostgreSQL queries
    const [users] = await connection.execute('SELECT user_id, username, email FROM users LIMIT 10');
    const [tables] = await connection.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");

    console.log(`📊 Found ${users.length} users`);
    console.log(`📊 Found ${tables.length} tables`);

    return res.json({ 
      success: true, 
      usersCount: users.length, 
      users: users, 
      tables: tables.map(t => t.table_name) 
    });

  } catch (error) {
    console.error('🔥 TEST ERROR:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
};