const db = require("../config/db");
const supabase = require("../config/supabase");

// Create artwork (simple metadata insert) - DEPRECATED, use uploadArtwork instead
exports.createArtwork = async (req, res) => {
  return res.status(400).json({ 
    error: "Use POST /api/artwork/upload with multipart/form-data (image file) instead"
  });
};

// Get all artworks
exports.getAllArtworks = async (req, res) => {
  try {
    const sql = `
      SELECT artwork.*, users.username, users.profile_picture
      FROM artwork 
      JOIN users ON artwork.user_id = users.user_id
      ORDER BY artwork.artwork_id DESC
    `;
    const result = await db.query(sql);
    const formattedRows = result.rows.map(row => ({
      ...row,
      image_url: row.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
      profile_picture: row.profile_picture || 'https://via.placeholder.com/40?text=User'
    }));
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get one artwork by id
exports.getArtworkById = async (req, res) => {
  const { artwork_id } = req.params;
  if (!artwork_id) return res.status(400).json({ error: "Missing artwork id" });

  try {
    const sql = `
      SELECT artwork.*, users.username, users.profile_picture
      FROM artwork
      JOIN users ON artwork.user_id = users.user_id
      WHERE artwork.artwork_id = $1
    `;
    const result = await db.query(sql, [artwork_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Artwork not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get artworks by a specific user
exports.getArtworksByUser = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "Missing user id" });

  try {
    const sql = `
      SELECT artwork.*, users.username, users.profile_picture
      FROM artwork
      JOIN users ON artwork.user_id = users.user_id
      WHERE artwork.user_id = $1
      ORDER BY artwork.artwork_id DESC
    `;
    const result = await db.query(sql, [user_id]);
    const formattedRows = result.rows.map(row => ({
      ...row,
      image_url: row.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
      profile_picture: row.profile_picture || 'https://via.placeholder.com/40?text=User'
    }));
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Edit/update an artwork's metadata (title, caption, image_url)
exports.editArtwork = async (req, res) => {
  const { artwork_id } = req.body;
  // accept either user_id or userId
  const user_id = req.body.user_id || req.body.userId;
  const { title, caption, image_url } = req.body;
  if (!artwork_id || !user_id) return res.status(400).json({ error: "Missing ids" });

  try {
    const checkSql = 'SELECT user_id FROM artwork WHERE artwork_id = $1';
    const checkRes = await db.query(checkSql, [artwork_id]);
    if (checkRes.rows.length === 0) return res.status(404).json({ error: "Artwork not found" });

    // compare as strings (UUIDs) instead of Number()
    if (String(checkRes.rows[0].user_id) !== String(user_id)) return res.status(403).json({ error: "Not authorized to edit this artwork" });

    const fields = [];
    const params = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title = $${idx++}`); params.push(title); }
    if (caption !== undefined) { fields.push(`caption = $${idx++}`); params.push(caption); }
    if (image_url !== undefined) { fields.push(`image_url = $${idx++}`); params.push(image_url); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    const sql = `UPDATE artwork SET ${fields.join(', ')} WHERE artwork_id = $${idx}`;
    params.push(artwork_id);
    await db.query(sql, params);
    res.json({ message: "Artwork updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete artwork (ownership required)
exports.deleteArtwork = async (req, res) => {
  const { artwork_id } = req.body;
  const user_id = req.body.user_id || req.body.userId;
  if (!artwork_id || !user_id) return res.status(400).json({ error: "Missing ids" });

  try {
    const checkSql = 'SELECT user_id FROM artwork WHERE artwork_id = $1';
    const checkRes = await db.query(checkSql, [artwork_id]);
    if (checkRes.rows.length === 0) return res.status(404).json({ error: "Artwork not found" });

    if (String(checkRes.rows[0].user_id) !== String(user_id)) return res.status(403).json({ error: "Not authorized to delete this artwork" });

    const sql = 'DELETE FROM artwork WHERE artwork_id = $1';
    await db.query(sql, [artwork_id]);
    res.json({ message: "Artwork deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Upload artwork with image to Supabase Storage
exports.uploadArtwork = async (req, res) => {
  try {
    // accept user_id or userId (FormData from frontend)
    const user_id = req.body.user_id || req.body.userId;
    const { title, caption, hashtags } = req.body;

    if (!user_id || !title || !req.file) {
      return res.status(400).json({ 
        success: false,
        error: "Missing user_id, title, or image file" 
      });
    }

    // Upload image to Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${req.file.originalname}`;
    
    const { error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ success: false, error: uploadError.message });
    }

    const { data } = supabase.storage.from('artworks').getPublicUrl(fileName);
    const image_url = data.publicUrl;

    const query = `
      INSERT INTO artwork (user_id, title, caption, image_url) 
      VALUES ($1, $2, $3, $4) 
      RETURNING artwork_id
    `;
    
    const result = await db.query(query, [user_id, title, caption || '', image_url]);
    const artwork_id = result.rows[0].artwork_id;

    // Handle hashtags if provided
    if (hashtags && hashtags.trim()) {
      const tagArray = hashtags.split(' ').filter(tag => tag.startsWith('#') || tag);
      
      for (const tag of tagArray) {
        const cleanTag = tag.replace('#', '').toLowerCase();
        
        // Insert or get hashtag
        const hashtagQuery = `
          INSERT INTO hashtags (tag) VALUES ($1) 
          ON CONFLICT (tag) DO NOTHING 
          RETURNING hashtag_id
        `;
        
        const hashtagResult = await db.query(hashtagQuery, [cleanTag]);
        
        if (hashtagResult.rows.length > 0) {
          const hashtag_id = hashtagResult.rows[0].hashtag_id;
          
          // Link hashtag to artwork
          const linkQuery = `
            INSERT INTO artwork_hashtags (artwork_id, hashtag_id) 
            VALUES ($1, $2) 
            ON CONFLICT DO NOTHING
          `;
          await db.query(linkQuery, [artwork_id, hashtag_id]);
        }
      }
    }

    res.status(201).json({ 
      success: true,
      message: "Artwork uploaded successfully!",
      artwork_id,
      image_url
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};