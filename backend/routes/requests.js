// routes/requests.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/requests -> todas las peticiones, visibles para cualquier usuario logueado
router.get("/", requireAuth, (req, res) => {
  const requests = db
    .prepare(
      `SELECT r.id, r.message, r.created_at, r.user_id, u.name AS user_name
       FROM requests r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC`
    )
    .all();

  res.json(requests);
});

// POST /api/requests -> crear una petición nueva
router.post("/", requireAuth, (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "El mensaje no puede estar vacío." });
  }

  const result = db
    .prepare("INSERT INTO requests (user_id, message) VALUES (?, ?)")
    .run(req.userId, message.trim());

  res.status(201).json({ id: result.lastInsertRowid });
});

// DELETE /api/requests/:id -> borrar una petición (solo el autor o un admin)
router.delete("/:id", requireAuth, (req, res) => {
  const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
  if (!request) return res.status(404).json({ error: "Petición no encontrada." });

  const me = db.prepare("SELECT role FROM users WHERE id = ?").get(req.userId);
  const isOwner = request.user_id === req.userId;
  const isAdmin = me && me.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "No puedes borrar una petición que no es tuya." });
  }

  db.prepare("DELETE FROM requests WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
