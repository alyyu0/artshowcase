const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ==================== LOGIN (Accepts both hashed and plain passwords) ====================
exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    console.log(`=== 🔐 LOGIN ATTEMPT STARTED ===`);
    console.log(`📥 Request body:`, JSON.stringify(req.body));
    console.log(`🕐 Time: ${new Date().toISOString()}`);
    console.log(`🔑 Login attempt for: "${username}"`);
    
    // Validate input
    if (!username || !password) {
        console.log(`❌ Missing username or password`);
        return res.status(400).json({ 
            success: false,
            error: 'Username and password are required' 
        });
    }
    
    try {
        // 1. Find user by username (including password)
        const sql = 'SELECT user_id, username, password, email, bio FROM users WHERE username = $1 LIMIT 1';
        console.log(`🔍 Searching for user: ${username}`);
        const result = await db.query(sql, [username]);
        
        // 2. Check if user exists
        if (result.rows.length === 0) {
            console.log(`❌ USER NOT FOUND: ${username}`);
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials' 
            });
        }
        
        const user = result.rows[0];
        const storedPassword = user.password;
        
        console.log(`👤 USER FOUND: ${user.username}`);
        console.log(`🔐 Stored password: ${storedPassword.substring(0, 30)}...`);
        console.log(`📝 Input password: ${password}`);
        
        // 3. Determine password type and validate
        let isValid = false;
        let passwordType = 'unknown';
        
        // Check if password is bcrypt hashed (starts with $2a$, $2b$, or $2y$)
        if (storedPassword.startsWith('$2')) {
            passwordType = 'bcrypt';
            console.log(`🔍 Password type: BCRYPT (hashed)`);
            
            // Compare with bcrypt
            try {
                isValid = await bcrypt.compare(password, storedPassword);
                console.log(`🔐 Bcrypt comparison result: ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
            } catch (bcryptError) {
                console.log(`⚠️ Bcrypt compare error:`, bcryptError.message);
                isValid = false;
            }
            
        } else {
            // Plain text password
            passwordType = 'plain-text';
            console.log(`🔍 Password type: PLAIN TEXT (not hashed)`);
            
            // Direct string comparison for plain text
            isValid = (password === storedPassword);
            console.log(`🔐 Plain text comparison: ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
            
            // Special case: if user has "placeholder" and tries to login with username123
            if (!isValid && storedPassword === 'placeholder') {
                console.log(`🔄 Trying auto-upgrade with username123 pattern...`);
                const autoPassword = user.username + '123';
                if (password === autoPassword) {
                    console.log(`✅ Auto-password match!`);
                    isValid = true;
                    
                    // Optionally upgrade to bcrypt
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(autoPassword, salt);
                        const updateSql = 'UPDATE users SET password = $1 WHERE username = $2';
                        await db.query(updateSql, [hashedPassword, username]);
                        console.log(`🆙 Password upgraded to bcrypt for ${username}`);
                    } catch (updateError) {
                        console.log(`⚠️ Failed to upgrade password:`, updateError.message);
                    }
                }
            }
        }
        
        // 4. If all checks failed
        if (!isValid) {
            console.log(`❌ LOGIN FAILED for ${username} (${passwordType})`);
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials',
                debug: {
                    passwordType: passwordType,
                    storedPasswordLength: storedPassword.length,
                    storedPasswordPreview: storedPassword.substring(0, 20)
                }
            });
        }
        
        // 5. Login successful - don't send password back
        const { password: _, ...userWithoutPassword } = user;
        
        console.log(`🎉 LOGIN SUCCESSFUL for ${username}`);
        console.log(`📤 Sending user data without password field`);
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword,
            debug: {
                passwordType: passwordType
            }
        });
        
    } catch (err) {
        console.error('❌ LOGIN ERROR:', err);
        res.status(500).json({ 
            success: false,
            error: 'Server error during login',
            debug: err.message
        });
    }
};

// ==================== CHECK PASSWORD FOR SPECIFIC USER ====================
exports.checkUserPassword = async (req, res) => {
    const { username } = req.params;
    
    try {
        const sql = 'SELECT username, password FROM users WHERE username = $1';
        const result = await db.query(sql, [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        const isBcrypt = user.password.startsWith('$2');
        const isPlaceholder = user.password === 'placeholder';
        
        res.json({
            username: user.username,
            passwordLength: user.password.length,
            passwordPreview: user.password.substring(0, 30) + (user.password.length > 30 ? '...' : ''),
            isBcrypt: isBcrypt,
            isPlaceholder: isPlaceholder,
            passwordType: isBcrypt ? 'bcrypt-hashed' : (isPlaceholder ? 'placeholder' : 'plain-text')
        });
        
    } catch (err) {
        console.error('Check password error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ==================== RESET PASSWORD TO PLAIN TEXT (for testing) ====================
exports.resetPassword = async (req, res) => {
    const { username, newPassword } = req.body;
    
    if (!username || !newPassword) {
        return res.status(400).json({ 
            success: false,
            error: 'Username and new password are required' 
        });
    }
    
    try {
        const sql = 'UPDATE users SET password = $1 WHERE username = $2 RETURNING username';
        const result = await db.query(sql, [newPassword, username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            message: `Password reset to: "${newPassword}"`,
            username: result.rows[0].username
        });
        
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Server error resetting password' 
        });
    }
};

// ==================== BULK RESET ALL PLACEHOLDER PASSWORDS ====================
exports.bulkResetPlaceholders = async (req, res) => {
    try {
        // Get all users with placeholder password
        const sql = "SELECT user_id, username FROM users WHERE password = 'placeholder'";
        const result = await db.query(sql);
        
        console.log(`Found ${result.rows.length} users with placeholder password`);
        
        for (const user of result.rows) {
            // Set password to username123
            const newPassword = user.username + '123';
            const updateSql = 'UPDATE users SET password = $1 WHERE user_id = $2';
            await db.query(updateSql, [newPassword, user.user_id]);
            
            console.log(`Reset ${user.username}: password = ${newPassword}`);
        }
        
        res.json({
            success: true,
            message: `Reset ${result.rows.length} placeholder passwords`,
            resetUsers: result.rows.map(u => ({
                username: u.username,
                newPassword: u.username + '123'
            }))
        });
        
    } catch (err) {
        console.error('Bulk reset error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Server error during bulk reset' 
        });
    }
};

// Keep your existing functions...
exports.getUserById = async (req, res) => {
  // ... keep existing code
};

exports.getUserByUsername = async (req, res) => {
  // ... keep existing code
};