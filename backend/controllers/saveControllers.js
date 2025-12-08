const db = require("../config/db");

// Save artwork
exports.saveArtwork = async (req, res) => {
  const { user_id, artwork_id } = req.body;

  if (!user_id || !artwork_id) {
    return res.status(400).json({ error: "Missing user or artwork ID" });
  }

  try {
    const query = "INSERT INTO saves (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *";
    const result = await db.query(query, [user_id, artwork_id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Already saved this artwork" });
    }
    
    res.json({ message: "Artwork saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Unsave artwork
exports.unsaveArtwork = async (req, res) => {
  const { user_id, artwork_id } = req.body;

  if (!user_id || !artwork_id) {
    return res.status(400).json({ error: "Missing IDs" });
  }

  try {
    const query = "DELETE FROM saves WHERE user_id = $1 AND artwork_id = $2";
    const result = await db.query(query, [user_id, artwork_id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Artwork not saved" });
    }
    res.json({ message: "Artwork unsaved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get user's saved artworks
exports.getSavedArtworks = async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT artwork.*, users.username, users.profile_picture,
        COALESCE(like_counts.count, 0) AS like_count,
        COALESCE(comment_counts.count, 0) AS comment_count
      FROM artwork
      INNER JOIN saves ON artwork.artwork_id = saves.artwork_id
      INNER JOIN users ON artwork.user_id = users.user_id
      LEFT JOIN (
        SELECT artwork_id, COUNT(*) AS count FROM likes GROUP BY artwork_id
      ) like_counts ON artwork.artwork_id = like_counts.artwork_id
      LEFT JOIN (
        SELECT artwork_id, COUNT(*) AS count FROM comments GROUP BY artwork_id
      ) comment_counts ON artwork.artwork_id = comment_counts.artwork_id
      WHERE saves.user_id = $1
      ORDER BY saves.created_at DESC
    `;
    const result = await db.query(query, [user_id]);
    const rows = result.rows.map(r => ({
      ...r,
      like_count: Number(r.like_count) || 0,
      comment_count: Number(r.comment_count) || 0,
      image_url: r.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
      profile_picture: r.profile_picture || 'https://via.placeholder.com/40?text=User'
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Check if artwork is saved
exports.isSaved = async (req, res) => {
  const { user_id, artwork_id } = req.params;

  try {
    const query = "SELECT * FROM saves WHERE user_id = $1 AND artwork_id = $2";
    const result = await db.query(query, [user_id, artwork_id]);
    res.json({ isSaved: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};