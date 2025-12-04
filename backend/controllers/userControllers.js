const db = require('../config/db');

// Get user profile by id
exports.getUserById = (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: 'Missing user id' });

  const sql = 'SELECT user_id, username, bio, profile_picture FROM users WHERE user_id = ? LIMIT 1';
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    if (user.profile_picture) {
      user.profile_picture = `http://localhost:5000${user.profile_picture}`;
    }
    
    res.json(user);
  });
};

module.exports = exports;