// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");
const { sendWelcomeEmail } = require("../services/email");

const router = express.Router();

// El email definido en .env como ADMIN_EMAIL se convierte automáticamente en administrador,
// tanto al registrarse como (si ya existía) la próxima vez que inicie sesión.
function isAdminEmail(email) {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  return adminEmail && email.toLowerCase() === adminEmail;
}

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const role = isAdminEmail(email) ? "admin" : "user";

  const result = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(name, email.toLowerCase(), passwordHash, role);

  const token = jwt.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, name, email: email.toLowerCase(), role },
  });

  // El email se envía "en segundo plano": si falla o tarda, no afecta a la respuesta ya enviada.
  sendWelcomeEmail({ name, email: email.toLowerCase() });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  // Auto-corrección: si este email coincide con ADMIN_EMAIL pero aún no tiene rol admin, se lo damos.
  let role = user.role || "user";
  if (isAdminEmail(user.email) && role !== "admin") {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
    role = "admin";
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role },
  });
});

module.exports = router;
