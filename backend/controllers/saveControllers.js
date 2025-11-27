const db = require("../config/db");

// Save artwork
exports.saveArtwork = (req, res) => {
  const { user_id, artwork_id } = req.body;

  if (!user_id || !artwork_id) {
    return res.status(400).json({ error: "Missing user or artwork ID" });
  }

  const sql = "INSERT INTO saves (user_id, artwork_id) VALUES (?, ?)";
  db.query(sql, [user_id, artwork_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Already saved this artwork" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Artwork saved successfully!" });
  });
};

// Unsave artwork
exports.unsaveArtwork = (req, res) => {
  const { user_id, artwork_id } = req.body;

  if (!user_id || !artwork_id) {
    return res.status(400).json({ error: "Missing IDs" });
  }

  const sql = "DELETE FROM saves WHERE user_id = ? AND artwork_id = ?";
  db.query(sql, [user_id, artwork_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artwork not saved" });
    }
    res.json({ message: "Artwork unsaved successfully!" });
  });
};

// Get user's saved artworks
exports.getSavedArtworks = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT artwork.*, users.username
    FROM artwork
    INNER JOIN saves ON artwork.artwork_id = saves.artwork_id
    INNER JOIN users ON artwork.user_id = users.user_id
    WHERE saves.user_id = ?
    ORDER BY saves.created_at DESC
  `;
  
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Check if artwork is saved
exports.isSaved = (req, res) => {
  const { user_id, artwork_id } = req.params;

  const sql = "SELECT * FROM saves WHERE user_id = ? AND artwork_id = ?";
  db.query(sql, [user_id, artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ isSaved: rows.length > 0 });
  });
};