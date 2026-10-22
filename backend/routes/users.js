// routes/users.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me -> devuelve los datos del usuario logueado
router.get("/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, age, height_cm, weight_kg, goal, created_at FROM users WHERE id = ?")
    .get(req.userId);

  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
  res.json(user);
});

// PUT /api/users/me -> actualiza los datos del perfil (edad, altura, peso, objetivo)
router.put("/me", requireAuth, (req, res) => {
  const { age, height_cm, weight_kg, goal } = req.body;

  db.prepare(
    `UPDATE users SET age = ?, height_cm = ?, weight_kg = ?, goal = ? WHERE id = ?`
  ).run(age ?? null, height_cm ?? null, weight_kg ?? null, goal ?? null, req.userId);

  const user = db
    .prepare("SELECT id, name, email, age, height_cm, weight_kg, goal FROM users WHERE id = ?")
    .get(req.userId);

  res.json(user);
});

module.exports = router;
