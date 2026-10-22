// routes/chat.js
//
// De momento el "entrenador IA" es una simulación basada en palabras clave.
// El código está organizado para que, en el futuro, sustituyas la función
// generateSimulatedReply() por una llamada real a una API de IA (Claude, etc.)
// sin tener que tocar el resto de la lógica (guardado en BD, rutas...).

const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function generateSimulatedReply(message, userProfile) {
  const text = message.toLowerCase();

  if (text.includes("peso") || text.includes("adelgaz") || text.includes("perder grasa")) {
    return "Para perder peso de forma saludable, el punto de partida es un déficit calórico moderado (unas 300-500 kcal/día por debajo de tu mantenimiento) combinado con entrenamiento de fuerza 3-4 días/semana y algo de cardio. ¿Quieres que te proponga una rutina semanal orientativa?";
  }
  if (text.includes("gan") && (text.includes("muscul") || text.includes("masa"))) {
    return "Para ganar masa muscular necesitas superávit calórico ligero, suficiente proteína (aprox. 1.6-2.2 g por kg de peso corporal) y entrenamiento de fuerza progresivo. ¿Cuántos días a la semana puedes entrenar?";
  }
  if (text.includes("rutina") || text.includes("entrenamiento") || text.includes("plan")) {
    return "Puedo ayudarte a diseñar una rutina. Cuéntame: ¿tu objetivo es fuerza, resistencia, pérdida de peso o tonificación, y cuántos días a la semana puedes entrenar?";
  }
  if (text.includes("dieta") || text.includes("comer") || text.includes("nutrici")) {
    return "La nutrición es clave junto al entrenamiento. Como base general: prioriza proteína en cada comida, verduras, carbohidratos de calidad según tu actividad, y mantente hidratado. ¿Buscas perder peso, ganar músculo o mantenerte?";
  }
  if (text.includes("cardio")) {
    return "El cardio es útil tanto para salud cardiovascular como para el control del peso. Puedes empezar con 2-3 sesiones de 20-30 minutos a intensidad moderada (caminar rápido, bici, elíptica) e ir progresando.";
  }
  if (text.includes("hola") || text.includes("buenas") || text.includes("buenos dias") || text.includes("buenos días")) {
    const nombre = userProfile?.name ? `, ${userProfile.name}` : "";
    return `¡Hola${nombre}! Soy tu entrenador personal virtual. Cuéntame tu objetivo (perder peso, ganar músculo, mejorar resistencia...) y te iré guiando.`;
  }

  return "Entendido, lo tengo en cuenta. Cuéntame un poco más sobre tu objetivo, tu nivel actual o cuántos días puedes entrenar para poder orientarte mejor. (Nota: este es un entrenador simulado; próximamente se conectará a una IA real).";
}

// GET /api/chat/history -> devuelve el historial de conversación del usuario logueado
router.get("/history", requireAuth, (req, res) => {
  const messages = db
    .prepare("SELECT role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY id ASC")
    .all(req.userId);
  res.json(messages);
});

// POST /api/chat -> envía un mensaje y recibe la respuesta del entrenador simulado
router.post("/", requireAuth, (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "El mensaje no puede estar vacío." });
  }

  const userProfile = db.prepare("SELECT name FROM users WHERE id = ?").get(req.userId);

  db.prepare("INSERT INTO chat_messages (user_id, role, content) VALUES (?, 'user', ?)").run(
    req.userId,
    message
  );

  const reply = generateSimulatedReply(message, userProfile);

  db.prepare("INSERT INTO chat_messages (user_id, role, content) VALUES (?, 'assistant', ?)").run(
    req.userId,
    reply
  );

  res.json({ reply });
});

module.exports = router;
