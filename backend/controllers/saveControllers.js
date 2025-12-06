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
      SELECT artwork.*, users.username, users.profile_picture
      FROM artwork
      INNER JOIN saves ON artwork.artwork_id = saves.artwork_id
      INNER JOIN users ON artwork.user_id = users.user_id
      WHERE saves.user_id = $1
      ORDER BY saves.created_at DESC
    `;
    const result = await db.query(query, [user_id]);
    res.json(result.rows);
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