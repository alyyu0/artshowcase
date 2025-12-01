const express = require('express');
const router = express.Router();

const searchController = require('../controllers/searchControllers');

// Search users by username (partial match)
router.get('/users/:query', searchController.searchUsers);

// Get artworks for a given hashtag (exact match on tag)
router.get('/hashtags/:tag', searchController.getArtworksByHashtag);

// Search hashtags by partial query (returns matching tags)
router.get('/hashtags/search/:query', searchController.searchHashtags);

module.exports = router;
