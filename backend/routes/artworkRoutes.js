const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const {
	createArtwork,
	getAllArtworks,
	getArtworkById,
	getArtworksByUser,
	editArtwork,
	deleteArtwork,
	uploadArtwork,
} = require("../controllers/artworkControllers");

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Configure cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/create", createArtwork);
router.post("/upload", upload.single("image"), uploadArtwork);
router.get("/all", getAllArtworks);
router.get("/:artwork_id", getArtworkById);
router.get("/user/:user_id", getArtworksByUser);
router.put("/edit", editArtwork);
router.delete("/delete", deleteArtwork);

module.exports = router;
