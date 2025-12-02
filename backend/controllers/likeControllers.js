const db = require("../config/db");

// Like an artwork
exports.likeArtwork = (req, res) => {
  const { user_id, artwork_id } = req.body;
  if (!user_id || !artwork_id) return res.status(400).json({ error: "Missing user or artwork ID" });

  const sql = "INSERT INTO likes (user_id, artwork_id) VALUES (?, ?)";
  db.query(sql, [user_id, artwork_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Already liked this artwork" });
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Artwork liked successfully!" });
  });
};

// Unlike an artwork
exports.unlikeArtwork = (req, res) => {
  const { user_id, artwork_id } = req.body;
  if (!user_id || !artwork_id) return res.status(400).json({ error: "Missing IDs" });

  const sql = "DELETE FROM likes WHERE user_id = ? AND artwork_id = ?";
  db.query(sql, [user_id, artwork_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Like not found" });
    res.json({ message: "Artwork unliked successfully!" });
  });
};

// Get likes for an artwork (optionally return count + users)
exports.getLikesForArtwork = (req, res) => {
  const { artwork_id } = req.params;
  const sql = `
    SELECT users.user_id, users.username
    FROM users
    INNER JOIN likes ON users.user_id = likes.user_id
    WHERE likes.artwork_id = ?
  `;
  db.query(sql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: rows.length, users: rows });
  });
};

// Get artworks liked by a user
exports.getLikedArtworksForUser = (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT artwork.*, users.username
    FROM artwork
    INNER JOIN likes ON artwork.artwork_id = likes.artwork_id
    INNER JOIN users ON artwork.user_id = users.user_id
    WHERE likes.user_id = ?
    ORDER BY likes.like_id DESC
  `;
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Check if a user liked an artwork
exports.isLiked = (req, res) => {
  const { user_id, artwork_id } = req.params;
  const sql = "SELECT 1 FROM likes WHERE user_id = ? AND artwork_id = ? LIMIT 1";
  db.query(sql, [user_id, artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ isLiked: rows.length > 0 });
  });
};