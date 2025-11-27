const express = require("express");
const router = express.Router();
const followController = require("../controllers/followControllers");

router.post("/follow", followController.followUser);
router.post("/unfollow", followController.unfollowUser);
router.get("/followers/:user_id", followController.getFollowers);
router.get("/following/:user_id", followController.getFollowing);
router.get("/check/:follower_id/:following_id", followController.isFollowing);

module.exports = router;