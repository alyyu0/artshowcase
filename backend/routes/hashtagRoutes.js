const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET hashtags for a specific artwork
router.get('/artwork/:artworkId', async (req, res) => {
  try {
    const { artworkId } = req.params;
    const query = `
      SELECT h.hashtag_id, h.tag
      FROM hashtags h
      INNER JOIN artwork_hashtags ah ON h.hashtag_id = ah.hashtag_id
      WHERE ah.artwork_id = $1
      ORDER BY h.tag
    `;
    const result = await db.query(query, [artworkId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching hashtags for artwork:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
