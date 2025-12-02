const db = require("../config/db");

// Add a comment
exports.addComment = (req, res) => {
  const { user_id, artwork_id, content } = req.body;
  if (!user_id || !artwork_id || !content) return res.status(400).json({ error: "Missing fields" });

  const sql = "INSERT INTO comments (user_id, artwork_id, content) VALUES (?, ?, ?)";
  db.query(sql, [user_id, artwork_id, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Comment added", comment_id: result.insertId });
  });
};

// Delete a comment (owner only)
exports.deleteComment = (req, res) => {
  const { comment_id, user_id } = req.body;
  if (!comment_id || !user_id) return res.status(400).json({ error: "Missing IDs" });

  const sql = "DELETE FROM comments WHERE comment_id = ? AND user_id = ?";
  db.query(sql, [comment_id, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Comment not found or not owner" });
    res.json({ message: "Comment deleted" });
  });
};

// Edit a comment (owner only)
exports.editComment = (req, res) => {
  const { comment_id, user_id, content } = req.body;
  if (!comment_id || !user_id || !content) return res.status(400).json({ error: "Missing fields" });

  const sql = "UPDATE comments SET content = ? WHERE comment_id = ? AND user_id = ?";
  db.query(sql, [content, comment_id, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Comment not found or not owner" });
    res.json({ message: "Comment updated" });
  });
};

// Get comments for an artwork
exports.getCommentsForArtwork = (req, res) => {
  const { artwork_id } = req.params;
  const sql = `
    SELECT c.comment_id, c.content, c.created_at, u.user_id, u.username
    FROM comments c
    INNER JOIN users u ON c.user_id = u.user_id
    WHERE c.artwork_id = ?
    ORDER BY c.created_at DESC
  `;
  db.query(sql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};