const db = require("../config/db");

exports.createArtwork = (req, res) => {
  const { user_id, image_url, title } = req.body;

  if (!user_id || !image_url || !title)
    return res.status(400).json({ error: "Missing fields" });

  const sql = "INSERT INTO artwork (user_id, image_url, title) VALUES (?, ?, ?)";

  db.query(sql, [user_id, image_url, title], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Artwork posted successfully!" });
  });
};

exports.getAllArtworks = (req, res) => {
  const sql = `
    SELECT artwork.*, users.username 
    FROM artwork 
    JOIN users ON artwork.user_id = users.user_id
    ORDER BY artwork.artwork_id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// Get one artwork by id
exports.getArtworkById = (req, res) => {
  const { artwork_id } = req.params;
  if (!artwork_id) return res.status(400).json({ error: "Missing artwork id" });

  const sql = `
    SELECT artwork.*, users.username
    FROM artwork
    JOIN users ON artwork.user_id = users.user_id
    WHERE artwork.artwork_id = ?
  `;

  db.query(sql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    res.json(rows[0]);
  });
};

// Get artworks by a specific user
exports.getArtworksByUser = (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "Missing user id" });

  const sql = `
    SELECT artwork.*, users.username
    FROM artwork
    JOIN users ON artwork.user_id = users.user_id
    WHERE artwork.user_id = ?
    ORDER BY artwork.artwork_id DESC
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// Edit/update an artwork's metadata (title, caption, image_url)
exports.editArtwork = (req, res) => {
  const { artwork_id, user_id, title, caption, image_url } = req.body;
  if (!artwork_id || !user_id) return res.status(400).json({ error: "Missing ids" });

  // Check ownership
  const checkSql = "SELECT user_id FROM artwork WHERE artwork_id = ?";
  db.query(checkSql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    if (rows[0].user_id !== Number(user_id)) return res.status(403).json({ error: "Not authorized to edit this artwork" });

    // Build dynamic update
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push("title = ?"); params.push(title); }
    if (caption !== undefined) { fields.push("caption = ?"); params.push(caption); }
    if (image_url !== undefined) { fields.push("image_url = ?"); params.push(image_url); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    const sql = `UPDATE artwork SET ${fields.join(', ')} WHERE artwork_id = ?`;
    params.push(artwork_id);
    db.query(sql, params, (updateErr, result) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ message: "Artwork updated successfully" });
    });
  });
};

// Delete artwork (ownership required)
exports.deleteArtwork = (req, res) => {
  const { artwork_id, user_id } = req.body;
  if (!artwork_id || !user_id) return res.status(400).json({ error: "Missing ids" });

  const checkSql = "SELECT user_id FROM artwork WHERE artwork_id = ?";
  db.query(checkSql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    if (rows[0].user_id !== Number(user_id)) return res.status(403).json({ error: "Not authorized to delete this artwork" });

    const sql = "DELETE FROM artwork WHERE artwork_id = ?";
    db.query(sql, [artwork_id], (delErr, result) => {
      if (delErr) return res.status(500).json({ error: delErr.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Artwork not found" });
      res.json({ message: "Artwork deleted successfully" });
    });
  });
};