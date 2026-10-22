// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");
const classRoutes = require("./routes/classes");
const bookingRoutes = require("./routes/bookings");
const requestRoutes = require("./routes/requests");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Solo en la demo pública del portfolio (DEMO=1): cinta con las cuentas de prueba. Ver demo.js.
require("./demo")(app, path.join(__dirname, "..", "frontend"));

// Sirve el frontend estático (para no tener que levantar dos servidores distintos)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/requests", requestRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅ Servidor del gimnasio corriendo en http://localhost:${PORT}`);
});
