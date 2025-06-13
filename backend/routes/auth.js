// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { pool } = require("../config/database");

const JWT_SECRET = "your-super-secret-key-that-should-be-long-and-random";

/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan pengguna baru
 * @access  Public
 */
router.post(
  "/register",
  [
    check("name", "Nama tidak boleh kosong").not().isEmpty(),
    check("email", "Mohon masukkan email yang valid").isEmail(),
    check("password", "Password minimal harus 6 karakter").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Cek apakah email sudah terdaftar
      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ msg: "Email sudah terdaftar" });
      }

      // Enkripsi password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user baru ke database
      const [result] = await pool.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );

      const userId = result.insertId;
      console.log("Pengguna terdaftar dengan ID:", userId);

      // Buat dan kembalikan token JWT
      const payload = { user: { id: userId } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: userId,
            name,
            email,
          },
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login pengguna & mendapatkan token
 * @access  Public
 */
router.post(
  "/login",
  [
    check("email", "Mohon masukkan email yang valid").isEmail(),
    check("password", "Password tidak boleh kosong").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Cek pengguna di database
      const [users] = await pool.execute(
        "SELECT id, name, email, password FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.status(400).json({ msg: "Kredensial tidak valid" });
      }

      const user = users[0];

      // Bandingkan password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Kredensial tidak valid" });
      }

      console.log("Pengguna berhasil login:", user.email);

      // Buat dan kembalikan token JWT
      const payload = { user: { id: user.id } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

/**
 * @route   GET /api/auth/user/:id
 * @desc    Mendapatkan informasi pengguna berdasarkan ID
 * @access  Public (dalam implementasi nyata, sebaiknya protected)
 */
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    }

    res.json({ user: users[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Mendapatkan daftar semua pengguna (untuk testing)
 * @access  Public (dalam implementasi nyata, sebaiknya admin only)
 */
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
    );

    res.json({
      count: users.length,
      users: users,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
