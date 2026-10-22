// routes/classes.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

const router = express.Router();

// GET /api/classes -> listado público de clases con plazas disponibles calculadas
router.get("/", (req, res) => {
  const sessions = db
    .prepare(
      `SELECT cs.*, 
              (SELECT COUNT(*) FROM bookings b WHERE b.session_id = cs.id) AS booked_count
       FROM class_sessions cs
       ORDER BY 
         CASE day_of_week
           WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miércoles' THEN 3
           WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sábado' THEN 6 WHEN 'Domingo' THEN 7
           ELSE 8 END,
         time_label`
    )
    .all();

  const withAvailability = sessions.map((s) => ({
    ...s,
    available_spots: Math.max(0, s.capacity - s.booked_count),
  }));

  res.json(withAvailability);
});

// POST /api/classes -> crear clase (solo admin)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { class_name, day_of_week, time_label, monitor_name, capacity } = req.body;

  if (!class_name || !day_of_week || !time_label) {
    return res.status(400).json({ error: "Nombre de clase, día y hora son obligatorios." });
  }

  const result = db
    .prepare(
      `INSERT INTO class_sessions (class_name, day_of_week, time_label, monitor_name, capacity)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(class_name, day_of_week, time_label, monitor_name || null, Number(capacity) || 15);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/classes/:id -> editar clase (solo admin)
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const { class_name, day_of_week, time_label, monitor_name, capacity } = req.body;

  const existing = db.prepare("SELECT id FROM class_sessions WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Clase no encontrada." });

  db.prepare(
    `UPDATE class_sessions SET class_name = ?, day_of_week = ?, time_label = ?, monitor_name = ?, capacity = ?
     WHERE id = ?`
  ).run(class_name, day_of_week, time_label, monitor_name || null, Number(capacity) || 15, req.params.id);

  res.json({ success: true });
});

// DELETE /api/classes/:id -> borrar clase y sus reservas asociadas (solo admin)
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM bookings WHERE session_id = ?").run(req.params.id);
  db.prepare("DELETE FROM class_sessions WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
