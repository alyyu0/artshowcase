const db = require("../config/db");

// Follow a user
exports.followUser = (req, res) => {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res.status(400).json({ error: "Missing follower or following ID" });
  }

  if (follower_id === following_id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  const sql = "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";
  db.query(sql, [follower_id, following_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Already following this user" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Successfully followed user!" });
  });
};

// Unfollow a user
exports.unfollowUser = (req, res) => {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res.status(400).json({ error: "Missing IDs" });
  }

  const sql = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";
  db.query(sql, [follower_id, following_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not following this user" });
    }
    res.json({ message: "Successfully unfollowed user!" });
  });
};

// Get followers
exports.getFollowers = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT users.user_id, users.username, users.email
    FROM users
    INNER JOIN follows ON users.user_id = follows.follower_id
    WHERE follows.following_id = ?
  `;
  
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Get following
exports.getFollowing = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT users.user_id, users.username, users.email
    FROM users
    INNER JOIN follows ON users.user_id = follows.following_id
    WHERE follows.follower_id = ?
  `;
  
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Check if following
exports.isFollowing = (req, res) => {
  const { follower_id, following_id } = req.params;

  const sql = "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?";
  db.query(sql, [follower_id, following_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ isFollowing: rows.length > 0 });
  });
};