const db = require("../config/db");

// Get top artworks by likes for a specific month and year
exports.getTopArtworksByMonth = async (req, res) => {
  const { month, year } = req.params;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    const query = `
      SELECT 
        a.artwork_id,
        a.title,
        a.image_url,
        u.user_id,
        u.username,
        u.profile_picture,
        COUNT(l.user_id) as total_likes
      FROM artwork a
      INNER JOIN users u ON a.user_id = u.user_id
      LEFT JOIN likes l ON a.artwork_id = l.artwork_id
      WHERE EXTRACT(MONTH FROM a.created_at) = $1 
        AND EXTRACT(YEAR FROM a.created_at) = $2
      GROUP BY a.artwork_id, u.user_id
      ORDER BY total_likes DESC
      LIMIT 50
    `;
    
    const result = await db.query(query, [month, year]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get top artists (by total likes) for a specific month and year
exports.getTopArtistsByMonth = async (req, res) => {
  const { month, year } = req.params;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.profile_picture,
        u.bio,
        COUNT(l.user_id) as total_likes,
        COUNT(DISTINCT a.artwork_id) as artwork_count
      FROM users u
      INNER JOIN artwork a ON u.user_id = a.user_id
      LEFT JOIN likes l ON a.artwork_id = l.artwork_id
      WHERE EXTRACT(MONTH FROM a.created_at) = $1 
        AND EXTRACT(YEAR FROM a.created_at) = $2
      GROUP BY u.user_id
      ORDER BY total_likes DESC
      LIMIT 50
    `;
    
    const result = await db.query(query, [month, year]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get top artworks by likes for a specific year
exports.getTopArtworksByYear = async (req, res) => {
  const { year } = req.params;

  if (!year) {
    return res.status(400).json({ error: "Year is required" });
  }

  try {
    const query = `
      SELECT 
        a.artwork_id,
        a.title,
        a.image_url,
        u.user_id,
        u.username,
        u.profile_picture,
        COUNT(l.user_id) as total_likes
      FROM artwork a
      INNER JOIN users u ON a.user_id = u.user_id
      LEFT JOIN likes l ON a.artwork_id = l.artwork_id
      WHERE EXTRACT(YEAR FROM a.created_at) = $1
      GROUP BY a.artwork_id, u.user_id
      ORDER BY total_likes DESC
      LIMIT 50
    `;
    
    const result = await db.query(query, [year]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get top artists (by total likes) for a specific year
exports.getTopArtistsByYear = async (req, res) => {
  const { year } = req.params;

  if (!year) {
    return res.status(400).json({ error: "Year is required" });
  }

  try {
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.profile_picture,
        u.bio,
        COUNT(l.user_id) as total_likes,
        COUNT(DISTINCT a.artwork_id) as artwork_count
      FROM users u
      INNER JOIN artwork a ON u.user_id = a.user_id
      LEFT JOIN likes l ON a.artwork_id = l.artwork_id
      WHERE EXTRACT(YEAR FROM a.created_at) = $1
      GROUP BY u.user_id
      ORDER BY total_likes DESC
      LIMIT 50
    `;
    
    const result = await db.query(query, [year]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all-time top artworks
exports.getTopArtworksAllTime = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.artwork_id,
        a.title,
        a.image_url,
        u.user_id,
        u.username,
        u.profile_picture,
        COUNT(l.user_id) as total_likes
      FROM artwork a
      INNER JOIN users u ON a.user_id = u.user_id
      LEFT JOIN likes l ON a.artwork_id = l.artwork_id
      GROUP BY a.artwork_id, u.user_id
      ORDER BY total_likes DESC
      LIMIT 50
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all-time top artists
exports.getTopArtistsAllTime = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.profile_picture,
        u.bio,
        COUNT(l.user_id) as total_likes,
        COUNT(DISTINCT a.artwork_id) as artwork_count
      FROM users u
      INNER JOIN artwork a ON u.user_id = a.user_id
      LEFT JOIN likes l ON a.artwork_id = l.artwork_id
      GROUP BY u.user_id
      ORDER BY total_likes DESC
      LIMIT 50
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
