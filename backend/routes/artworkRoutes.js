const express = require("express");
const router = express.Router();

const {
	createArtwork,
	getAllArtworks,
	getArtworkById,
	getArtworksByUser,
	editArtwork,
	deleteArtwork,
} = require("../controllers/artworkControllers");

router.post("/create", createArtwork);
router.get("/all", getAllArtworks);
router.get("/:artwork_id", getArtworkById);
router.get("/user/:user_id", getArtworksByUser);
router.put("/edit", editArtwork);
router.delete("/delete", deleteArtwork);

module.exports = router;
