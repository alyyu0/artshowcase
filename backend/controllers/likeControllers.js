const db = require("../config/db");

// Like an artwork
exports.likeArtwork = async (req, res) => {
  const { user_id, artwork_id } = req.body;
  if (!user_id || !artwork_id) return res.status(400).json({ error: "Missing user or artwork ID" });

  try {
    const query = "INSERT INTO likes (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *";
    const result = await db.query(query, [user_id, artwork_id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Already liked this artwork" });
    }
    
    res.json({ message: "Artwork liked successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Unlike an artwork
exports.unlikeArtwork = async (req, res) => {
  const { user_id, artwork_id } = req.body;
  if (!user_id || !artwork_id) return res.status(400).json({ error: "Missing IDs" });

  try {
    const query = "DELETE FROM likes WHERE user_id = $1 AND artwork_id = $2";
    const result = await db.query(query, [user_id, artwork_id]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: "Like not found" });
    res.json({ message: "Artwork unliked successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get likes for an artwork
exports.getLikesForArtwork = async (req, res) => {
  const { artwork_id } = req.params;
  
  try {
    const query = `
      SELECT users.user_id, users.username
      FROM users
      INNER JOIN likes ON users.user_id = likes.user_id
      WHERE likes.artwork_id = $1
    `;
    const result = await db.query(query, [artwork_id]);
    res.json({ count: result.rows.length, users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get artworks liked by a user
exports.getLikedArtworksForUser = async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const query = `
      SELECT artwork.*, users.username, users.profile_picture
      FROM artwork
      INNER JOIN likes ON artwork.artwork_id = likes.artwork_id
      INNER JOIN users ON artwork.user_id = users.user_id
      WHERE likes.user_id = $1
      ORDER BY likes.created_at DESC
    `;
    const result = await db.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Check if a user liked an artwork
exports.isLiked = async (req, res) => {
  const { user_id, artwork_id } = req.params;
  
  try {
    const query = "SELECT 1 FROM likes WHERE user_id = $1 AND artwork_id = $2 LIMIT 1";
    const result = await db.query(query, [user_id, artwork_id]);
    res.json({ isLiked: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};