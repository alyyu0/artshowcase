const db = require("../config/db");

// Follow a user
exports.followUser = async (req, res) => {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res.status(400).json({ error: "Missing follower or following ID" });
  }

  if (follower_id === following_id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  try {
    const query = "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *";
    const result = await db.query(query, [follower_id, following_id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Already following this user" });
    }
    
    res.json({ message: "Successfully followed user!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res.status(400).json({ error: "Missing IDs" });
  }

  try {
    const query = "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2";
    const result = await db.query(query, [follower_id, following_id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not following this user" });
    }
    res.json({ message: "Successfully unfollowed user!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT users.user_id, users.username, users.email, users.profile_picture
      FROM users
      INNER JOIN follows ON users.user_id = follows.follower_id
      WHERE follows.following_id = $1
    `;
    const result = await db.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT users.user_id, users.username, users.email, users.profile_picture
      FROM users
      INNER JOIN follows ON users.user_id = follows.following_id
      WHERE follows.follower_id = $1
    `;
    const result = await db.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Check if following
exports.isFollowing = async (req, res) => {
  const { follower_id, following_id } = req.params;

  try {
    const query = "SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2";
    const result = await db.query(query, [follower_id, following_id]);
    res.json({ isFollowing: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};