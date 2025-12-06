const db = require('../config/db');

// Get user profile by id
exports.getUserById = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: 'Missing user id' });

  try {
    const sql = 'SELECT user_id, username, bio, profile_picture FROM users WHERE user_id = $1 LIMIT 1';
    const result = await db.query(sql, [user_id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;