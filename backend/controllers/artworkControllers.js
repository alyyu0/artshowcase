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