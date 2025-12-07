// Get artworks from users that the current user follows
const db = require("../config/db");

exports.getFollowedArtworks = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "Missing user id" });

  try {
    // Return artworks created by users that the current user follows (only following direction)
    const sql = `
      SELECT artwork.*, users.username, users.profile_picture,
        COALESCE(like_counts.count, 0) AS like_count,
        COALESCE(comment_counts.count, 0) AS comment_count
      FROM artwork
      JOIN users ON artwork.user_id = users.user_id
      LEFT JOIN (
        SELECT artwork_id, COUNT(*) AS count FROM likes GROUP BY artwork_id
      ) like_counts ON artwork.artwork_id = like_counts.artwork_id
      LEFT JOIN (
        SELECT artwork_id, COUNT(*) AS count FROM comments GROUP BY artwork_id
      ) comment_counts ON artwork.artwork_id = comment_counts.artwork_id
      WHERE EXISTS (
        SELECT 1 FROM follows WHERE follows.follower_id = $1 AND follows.following_id = artwork.user_id
      )
      ORDER BY artwork.created_at DESC
    `;
    console.log('getFollowedArtworks called for user_id:', user_id);
    const result = await db.query(sql, [user_id]);
    console.log('getFollowedArtworks returned rows:', result.rows.length);
    const formattedRows = result.rows.map(row => ({
      ...row,
      image_url: row.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
      profile_picture: row.profile_picture || 'https://via.placeholder.com/40?text=User',
      like_count: Number(row.like_count) || 0,
      comment_count: Number(row.comment_count) || 0
    }));
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
