const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardControllers");

// Top artworks by month
router.get("/artworks/month/:month/:year", leaderboardController.getTopArtworksByMonth);

// Top artists by month
router.get("/artists/month/:month/:year", leaderboardController.getTopArtistsByMonth);

// Top artworks by year
router.get("/artworks/year/:year", leaderboardController.getTopArtworksByYear);

// Top artists by year
router.get("/artists/year/:year", leaderboardController.getTopArtistsByYear);

// All-time top artworks
router.get("/artworks/alltime", leaderboardController.getTopArtworksAllTime);

// All-time top artists
router.get("/artists/alltime", leaderboardController.getTopArtistsAllTime);

module.exports = router;
