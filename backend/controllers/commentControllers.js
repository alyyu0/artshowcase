const db = require("../config/db");

// Add a comment
exports.addComment = async (req, res) => {
  const { user_id, artwork_id, comment_text } = req.body;
  if (!user_id || !artwork_id || !comment_text) return res.status(400).json({ error: "Missing fields" });

  try {
    const query = "INSERT INTO comments (user_id, artwork_id, comment_text) VALUES ($1, $2, $3) RETURNING comment_id";
    const result = await db.query(query, [user_id, artwork_id, comment_text]);
    res.json({ message: "Comment added", comment_id: result.rows[0].comment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a comment (owner only)
exports.deleteComment = async (req, res) => {
  const { comment_id, user_id } = req.body;
  if (!comment_id || !user_id) return res.status(400).json({ error: "Missing IDs" });

  try {
    const query = "DELETE FROM comments WHERE comment_id = $1 AND user_id = $2";
    const result = await db.query(query, [comment_id, user_id]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: "Comment not found or not owner" });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Edit a comment (owner only)
exports.editComment = async (req, res) => {
  const { comment_id, user_id, comment_text } = req.body;
  if (!comment_id || !user_id || !comment_text) return res.status(400).json({ error: "Missing fields" });

  try {
    const query = "UPDATE comments SET comment_text = $1 WHERE comment_id = $2 AND user_id = $3";
    const result = await db.query(query, [comment_text, comment_id, user_id]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: "Comment not found or not owner" });
    res.json({ message: "Comment updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get comments for an artwork
exports.getCommentsForArtwork = async (req, res) => {
  const { artwork_id } = req.params;
  
  try {
    const query = `
      SELECT c.comment_id, c.comment_text, c.created_at, u.user_id, u.username, u.profile_picture
      FROM comments c
      INNER JOIN users u ON c.user_id = u.user_id
      WHERE c.artwork_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [artwork_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};