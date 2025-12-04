const db = require("../config/db");
const cloudinary = require("cloudinary").v2;

exports.createArtwork = (req, res) => {
  const { user_id, image_url, title } = req.body;

  if (!user_id || !image_url || !title)
    return res.status(400).json({ error: "Missing fields" });

  const sql = "INSERT INTO artwork (user_id, image_url, title) VALUES (?, ?, ?)";

  db.query(sql, [user_id, image_url, title], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Artwork posted successfully!" });
  });
};

exports.getAllArtworks = (req, res) => {
  const sql = `
    SELECT artwork.*, users.username, users.profile_picture
    FROM artwork 
    JOIN users ON artwork.user_id = users.user_id
    ORDER BY artwork.artwork_id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    
    // Format response with proper image URLs
    const formattedRows = rows.map(row => ({
      ...row,
      image_url: row.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
      profile_picture: row.profile_picture || 'https://via.placeholder.com/40?text=User'
    }));
    
    res.json(formattedRows);
  });
};

// Get one artwork by id
exports.getArtworkById = (req, res) => {
  const { artwork_id } = req.params;
  if (!artwork_id) return res.status(400).json({ error: "Missing artwork id" });

  const sql = `
    SELECT artwork.*, users.username, users.profile_picture
    FROM artwork
    JOIN users ON artwork.user_id = users.user_id
    WHERE artwork.artwork_id = ?
  `;

  db.query(sql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    res.json(rows[0]);
  });
};

// Get artworks by a specific user
exports.getArtworksByUser = (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "Missing user id" });

  const sql = `
    SELECT artwork.*, users.username, users.profile_picture
    FROM artwork
    JOIN users ON artwork.user_id = users.user_id
    WHERE artwork.user_id = ?
    ORDER BY artwork.artwork_id DESC
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    
    const formattedRows = rows.map(row => ({
      ...row,
      image_url: row.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
      profile_picture: row.profile_picture || 'https://via.placeholder.com/40?text=User'
    }));
    
    res.json(formattedRows);
  });
};

// Edit/update an artwork's metadata (title, caption, image_url)
exports.editArtwork = (req, res) => {
  const { artwork_id, user_id, title, caption, image_url } = req.body;
  if (!artwork_id || !user_id) return res.status(400).json({ error: "Missing ids" });

  // Check ownership
  const checkSql = "SELECT user_id FROM artwork WHERE artwork_id = ?";
  db.query(checkSql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    if (rows[0].user_id !== Number(user_id)) return res.status(403).json({ error: "Not authorized to edit this artwork" });

    // Build dynamic update
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push("title = ?"); params.push(title); }
    if (caption !== undefined) { fields.push("caption = ?"); params.push(caption); }
    if (image_url !== undefined) { fields.push("image_url = ?"); params.push(image_url); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    const sql = `UPDATE artwork SET ${fields.join(', ')} WHERE artwork_id = ?`;
    params.push(artwork_id);
    db.query(sql, params, (updateErr, result) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ message: "Artwork updated successfully" });
    });
  });
};

// Delete artwork (ownership required)
exports.deleteArtwork = (req, res) => {
  const { artwork_id, user_id } = req.body;
  if (!artwork_id || !user_id) return res.status(400).json({ error: "Missing ids" });

  const checkSql = "SELECT user_id FROM artwork WHERE artwork_id = ?";
  db.query(checkSql, [artwork_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    if (rows[0].user_id !== Number(user_id)) return res.status(403).json({ error: "Not authorized to delete this artwork" });

    const sql = "DELETE FROM artwork WHERE artwork_id = ?";
    db.query(sql, [artwork_id], (delErr, result) => {
      if (delErr) return res.status(500).json({ error: delErr.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Artwork not found" });
      res.json({ message: "Artwork deleted successfully" });
    });
  });
};

// Upload artwork with image to Cloudinary
exports.uploadArtwork = async (req, res) => {
  try {
    const { user_id, title, caption, hashtags } = req.body;

    if (!user_id || !title || !req.file) {
      return res.status(400).json({ 
        success: false,
        error: "Missing user_id, title, or image file" 
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "art_showcase" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const image_url = uploadResult.secure_url;

    // Insert into database
    const sql = "INSERT INTO artwork (user_id, title, caption, image_url) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [user_id, title, caption || '', image_url], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: err.message 
        });
      }

      const artwork_id = result.insertId;

      // Handle hashtags if provided
      if (hashtags && hashtags.trim()) {
        const tagArray = hashtags.split(' ').filter(tag => tag.startsWith('#') || tag);
        
        tagArray.forEach(tag => {
          const cleanTag = tag.replace('#', '').toLowerCase();
          
          // Insert or get hashtag
          const hashtagSql = "INSERT IGNORE INTO hashtags (tag) VALUES (?)";
          db.query(hashtagSql, [cleanTag], (err) => {
            if (!err) {
              // Link hashtag to artwork
              const linkSql = `
                INSERT INTO artwork_hashtags (artwork_id, hashtag_id)
                SELECT ?, hashtag_id FROM hashtags WHERE tag = ?
              `;
              db.query(linkSql, [artwork_id, cleanTag]);
            }
          });
        });
      }

      res.status(201).json({ 
        success: true,
        message: "Artwork uploaded successfully!",
        artwork_id,
        image_url
      });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};