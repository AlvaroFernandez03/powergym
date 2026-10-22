// middleware/admin.js
// Debe usarse SIEMPRE después de requireAuth (necesita req.userId ya establecido).
// Comprueba en la base de datos que el usuario tiene el rol "admin".

const db = require("../db/database");

function requireAdmin(req, res, next) {
  const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.userId);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "No tienes permisos de administrador." });
  }

  next();
}

module.exports = requireAdmin;
