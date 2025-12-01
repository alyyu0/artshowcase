const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeControllers");

router.post("/like", likeController.likeArtwork);
router.post("/unlike", likeController.unlikeArtwork);
router.get("/artwork/:artwork_id", likeController.getLikesForArtwork);
router.get("/user/:user_id", likeController.getLikedArtworksForUser);
router.get("/check/:user_id/:artwork_id", likeController.isLiked);

module.exports = router;