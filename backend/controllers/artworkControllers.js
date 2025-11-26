const db = require("../config/db");

exports.createArtwork = (req, res) => {
  const { user_id, image_url, caption } = req.body;

  if (!user_id || !image_url)
    return res.status(400).json({ error: "Missing fields" });

  const sql = "INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)";

  db.query(sql, [user_id, image_url, caption], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.json({ message: "Artwork posted successfully!" });
  });
};

exports.getAllArtworks = (req, res) => {
  const sql = `
    SELECT posts.*, users.username 
    FROM posts 
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    res.json(rows);
  });
};
