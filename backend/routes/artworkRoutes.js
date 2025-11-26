const express = require("express");
const router = express.Router();
const { createArtwork, getAllArtworks } = require("../controllers/artworkControllers");

router.post("/create", createArtwork);
router.get("/all", getAllArtworks);

module.exports = router;
