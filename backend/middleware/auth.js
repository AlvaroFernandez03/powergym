// middleware/auth.js
// Comprueba que la petición trae un token JWT válido en la cabecera "Authorization: Bearer <token>"
// Si es válido, guarda el id del usuario en req.userId y deja continuar.
// Si no, corta la petición con 401 (no autorizado).

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN" -> TOKEN

  if (!token) {
    return res.status(401).json({ error: "No has iniciado sesión (falta token)." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o caducada, vuelve a iniciar sesión." });
  }
}

module.exports = requireAuth;
