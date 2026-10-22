// routes/bookings.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/auth");
const { sendBookingConfirmation } = require("../services/email");

const router = express.Router();

// GET /api/bookings/me -> reservas del usuario logueado, con datos de la clase
router.get("/me", requireAuth, (req, res) => {
  const bookings = db
    .prepare(
      `SELECT b.id AS booking_id, b.created_at AS booked_at,
              cs.id AS session_id, cs.class_name, cs.day_of_week, cs.time_label, cs.monitor_name
       FROM bookings b
       JOIN class_sessions cs ON cs.id = b.session_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`
    )
    .all(req.userId);

  res.json(bookings);
});

// POST /api/bookings -> reservar plaza en una clase { session_id }
router.post("/", requireAuth, (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: "Falta el id de la clase." });

  const session = db.prepare("SELECT * FROM class_sessions WHERE id = ?").get(session_id);
  if (!session) return res.status(404).json({ error: "Esa clase ya no existe." });

  const bookedCount = db
    .prepare("SELECT COUNT(*) AS count FROM bookings WHERE session_id = ?")
    .get(session_id).count;

  if (bookedCount >= session.capacity) {
    return res.status(409).json({ error: "No quedan plazas disponibles para esta clase." });
  }

  let bookingId;
  try {
    const result = db
      .prepare("INSERT INTO bookings (user_id, session_id) VALUES (?, ?)")
      .run(req.userId, session_id);
    bookingId = result.lastInsertRowid;
  } catch (err) {
    // Salta por la restricción UNIQUE(user_id, session_id) si ya tenía reserva en esa clase
    return res.status(409).json({ error: "Ya tienes una reserva para esta clase." });
  }

  res.status(201).json({ id: bookingId });

  // Email de confirmación en segundo plano: si falla, no afecta a la reserva ya hecha.
  const user = db.prepare("SELECT name, email FROM users WHERE id = ?").get(req.userId);
  sendBookingConfirmation(user, session);
});

// DELETE /api/bookings/:id -> cancelar una reserva propia
router.delete("/:id", requireAuth, (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!booking) return res.status(404).json({ error: "Reserva no encontrada." });
  if (booking.user_id !== req.userId) {
    return res.status(403).json({ error: "No puedes cancelar una reserva que no es tuya." });
  }

  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
