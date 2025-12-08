const db = require('../config/db');

// Search users by username (partial, case-insensitive)
exports.searchUsers = async (req, res) => {
	const { query } = req.params;
	if (!query || query.trim() === '') return res.status(400).json({ error: 'Missing search query' });

	try {
		const sql = `SELECT user_id, username, bio, profile_picture FROM users WHERE username ILIKE $1 LIMIT 50`;
		const result = await db.query(sql, [`%${query}%`]);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};

// Search hashtags (return matching hashtag strings)
exports.searchHashtags = async (req, res) => {
	const { query } = req.params;
	if (!query || query.trim() === '') return res.status(400).json({ error: 'Missing query' });

	try {
		const sql = `SELECT hashtag_id, tag FROM hashtags WHERE tag ILIKE $1 ORDER BY tag LIMIT 50`;
		const result = await db.query(sql, [`%${query}%`]);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};

// Get artworks associated with a hashtag (exact match, accepts with or without leading '#')
exports.getArtworksByHashtag = async (req, res) => {
	let { tag } = req.params;
	if (!tag || tag.trim() === '') return res.status(400).json({ error: 'Missing tag' });

	tag = tag.startsWith('#') ? tag.slice(1) : tag;

	try {
		const sql = `
			SELECT artwork.*, users.username, users.profile_picture
			FROM artwork
			INNER JOIN artwork_hashtags ah ON artwork.artwork_id = ah.artwork_id
			INNER JOIN hashtags h ON ah.hashtag_id = h.hashtag_id
			INNER JOIN users ON artwork.user_id = users.user_id
			WHERE h.tag = $1
			ORDER BY artwork.artwork_id DESC
		`;
		const result = await db.query(sql, [tag]);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};

