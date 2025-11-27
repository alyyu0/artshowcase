const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveControllers");

router.post("/save", saveController.saveArtwork);
router.post("/unsave", saveController.unsaveArtwork);
router.get("/saved/:user_id", saveController.getSavedArtworks);
router.get("/check/:user_id/:artwork_id", saveController.isSaved);

module.exports = router;