const db = require('../config/db');

// Debug helper: return follow relationships and artwork feed for a user
exports.userFeedDebug = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  try {
    // who this user follows
    const followingRes = await db.query('SELECT following_id FROM follows WHERE follower_id = $1', [user_id]);
    const following = followingRes.rows.map(r => r.following_id);

    // who follows this user
    const followersRes = await db.query('SELECT follower_id FROM follows WHERE following_id = $1', [user_id]);
    const followers = followersRes.rows.map(r => r.follower_id);

    // artworks by each user the current user follows
    const artworksByFollowing = [];
    if (following.length > 0) {
      const q = `
        SELECT artwork.*, users.username, users.profile_picture
        FROM artwork
        JOIN users ON artwork.user_id = users.user_id
        WHERE artwork.user_id = ANY($1::uuid[])
        ORDER BY artwork.created_at DESC
      `;
      const artsRes = await db.query(q, [following]);
      artsRes.rows.forEach(r => artworksByFollowing.push(r));
    }

    // run the same feed SQL as followedArtworksController for comparison
    const feedSql = `
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
      WHERE artwork.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = $1
        UNION
        SELECT follower_id FROM follows WHERE following_id = $1
      )
      ORDER BY artwork.created_at DESC
    `;
    const feedRes = await db.query(feedSql, [user_id]);

    res.json({
      user_id,
      following_count: following.length,
      followers_count: followers.length,
      following,
      followers,
      artworksByFollowingCount: artworksByFollowing.length,
      artworksByFollowing,
      feedCount: feedRes.rows.length,
      feed: feedRes.rows
    });
  } catch (err) {
    console.error('userFeedDebug error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;
