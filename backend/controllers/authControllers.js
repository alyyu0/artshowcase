const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  bcrypt.hash(password, 10, (err, hashed) => {
    if (err) return res.status(500).json({ error: "Hashing failed" });

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [username, email, hashed], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.json({ message: "User registered successfully!" });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(401).json({ error: "User not found" });

    const user = rows[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ error: "Password check failed" });
      if (!match) return res.status(401).json({ error: "Incorrect password" });

      res.json({ message: "Login successful!", userId: user.user_id });
    });
  });
};