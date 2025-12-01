const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentControllers");

router.post("/add", commentController.addComment);
router.delete("/delete", commentController.deleteComment);
router.put("/edit", commentController.editComment);
router.get("/artwork/:artwork_id", commentController.getCommentsForArtwork);

module.exports = router;