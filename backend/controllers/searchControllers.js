const db = require('../config/db');

// Search users by username (partial, case-insensitive)
exports.searchUsers = (req, res) => {
	const { query } = req.params;
	if (!query || query.trim() === '') return res.status(400).json({ error: 'Missing search query' });

	const like = `%${query}%`;
	const sql = `SELECT user_id, username, bio, profile_picture FROM users WHERE username LIKE ? LIMIT 50`;
	db.query(sql, [like], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
};

// Search hashtags (return matching hashtag strings)
exports.searchHashtags = (req, res) => {
	const { query } = req.params;
	if (!query || query.trim() === '') return res.status(400).json({ error: 'Missing query' });

	const like = `%${query}%`;
	const sql = `SELECT hashtag_id, tag FROM hashtags WHERE tag LIKE ? ORDER BY tag LIMIT 50`;
	db.query(sql, [like], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
};

// Get artworks associated with a hashtag (exact match, accepts with or without leading '#')
exports.getArtworksByHashtag = (req, res) => {
	let { tag } = req.params;
	if (!tag || tag.trim() === '') return res.status(400).json({ error: 'Missing tag' });

	tag = tag.startsWith('#') ? tag.slice(1) : tag;

	const sql = `
		SELECT artwork.*, users.username
		FROM artwork
		INNER JOIN artwork_hashtags ah ON artwork.artwork_id = ah.artwork_id
		INNER JOIN hashtags h ON ah.hashtag_id = h.hashtag_id
		INNER JOIN users ON artwork.user_id = users.user_id
		WHERE h.tag = ?
		ORDER BY artwork.artwork_id DESC
	`;

	db.query(sql, [tag], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
};

