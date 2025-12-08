const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
	createArtwork,
	getAllArtworks,
	getArtworkById,
	getArtworksByUser,
	editArtwork,
	deleteArtwork,
	uploadArtwork,
} = require("../controllers/artworkControllers");
const { getFollowedArtworks } = require("../controllers/followedArtworksController");

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// DEPRECATED: use /upload instead
router.post("/create", createArtwork);

// Main upload endpoint (multipart/form-data with image file)
router.post("/upload", upload.single("image"), uploadArtwork);

// Read endpoints
router.get("/all", getAllArtworks);
router.get("/followed/:user_id", getFollowedArtworks);
router.get("/:artwork_id", getArtworkById);
router.get("/user/:user_id", getArtworksByUser);

// Update & Delete endpoints
router.put("/edit", editArtwork);
router.delete("/delete", deleteArtwork);

module.exports = router;
