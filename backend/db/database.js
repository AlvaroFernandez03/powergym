// db/database.js
// Crea (si no existe) el archivo de base de datos SQLite y define las tablas.
// SQLite guarda todo en un único archivo: gym.db (se crea solo la primera vez que arrancas el server).

const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.join(__dirname, "gym.db");
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL;");

// Tabla de usuarios: guarda los datos de login y el perfil físico/objetivo de cada persona
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    age INTEGER,
    height_cm REAL,
    weight_kg REAL,
    goal TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Migración segura: si la tabla users ya existía sin la columna "role" (proyectos creados
// antes de añadir el panel de admin), la añadimos ahora. Si ya existe, ignoramos el error.
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';`);
} catch (err) {
  if (!String(err.message).includes("duplicate column")) throw err;
}

// Tabla del historial de chat con el "entrenador IA" (simulado por ahora)
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Tabla de clases programadas (horario). Las gestiona el administrador desde el panel.
db.exec(`
  CREATE TABLE IF NOT EXISTS class_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    time_label TEXT NOT NULL,
    monitor_name TEXT,
    capacity INTEGER NOT NULL DEFAULT 15,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Tabla de reservas: qué usuario ha reservado plaza en qué clase
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (session_id) REFERENCES class_sessions (id),
    UNIQUE (user_id, session_id)
  );
`);

// Tabla de peticiones/sugerencias de los usuarios (visibles para todos los usuarios registrados)
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Si aún no hay ninguna clase programada, añadimos unas de ejemplo (solo la primera vez).
const classCount = db.prepare("SELECT COUNT(*) AS count FROM class_sessions").get().count;
if (classCount === 0) {
  const insertClass = db.prepare(
    `INSERT INTO class_sessions (class_name, day_of_week, time_label, monitor_name, capacity)
     VALUES (?, ?, ?, ?, ?)`
  );
  insertClass.run("Spinning", "Lunes", "18:00", "Marta Serrano", 15);
  insertClass.run("Yoga", "Martes", "09:00", "Laura Gómez", 12);
  insertClass.run("CrossTraining", "Miércoles", "19:00", "Carlos Ruiz", 10);
  insertClass.run("Boxeo fitness", "Jueves", "18:00", "David Torres", 12);
  insertClass.run("Pilates", "Viernes", "10:00", "Laura Gómez", 12);
  insertClass.run("Zumba", "Martes", "20:00", "Marta Serrano", 18);
  insertClass.run("CrossTraining", "Sábado", "11:00", "Carlos Ruiz", 10);
}

// ---------------------------------------------------------------------------
// Datos de la DEMO pública del portfolio (solo con DEMO=1; ver demo.js).
// ---------------------------------------------------------------------------
// En tu ordenador no se ejecuta nunca. En la demo, como la base de datos se
// crea de cero cada vez que el servidor despierta, deja dos cuentas listas
// para entrar (contraseña "powergym123") y algo de actividad para que la web
// no se vea vacía: un par de reservas y unas peticiones en el tablón.
if (process.env.DEMO === "1" && db.prepare("SELECT COUNT(*) AS n FROM users").get().n === 0) {
  const bcrypt = require("bcryptjs");
  const clave = bcrypt.hashSync("powergym123", 10);
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, role, age, height_cm, weight_kg, goal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  insertUser.run("Dirección PowerGym", "admin@powergym.com", clave, "admin", null, null, null, null);
  const socio = insertUser.run("Daniel Ortiz", "socio@powergym.com", clave, "user", 29, 178, 76, "ganar_musculo").lastInsertRowid;
  // Socios "de relleno" para el tablón de peticiones (con una contraseña que nadie conoce).
  const otra = bcrypt.hashSync(require("crypto").randomBytes(12).toString("hex"), 10);
  const nuria = insertUser.run("Nuria Campos", "nuria@ejemplo.com", otra, "user", 34, 165, 61, "perder_peso").lastInsertRowid;
  const ivan = insertUser.run("Iván Molina", "ivan@ejemplo.com", otra, "user", 41, 182, 88, "rendimiento").lastInsertRowid;

  const peticion = db.prepare("INSERT INTO requests (user_id, message, created_at) VALUES (?, ?, datetime('now', ?))");
  peticion.run(nuria, "¿Podríais abrir una clase de yoga los sábados por la mañana? Entre semana no llego.", "-3 days");
  peticion.run(ivan, "Estaría genial tener un segundo banco de press en la zona de peso libre, a última hora siempre hay cola.", "-1 days");
  peticion.run(socio, "Gracias por mover el spinning de los lunes a las 18:00, ahora me viene perfecto.", "-5 hours");

  // El socio de prueba ya tiene un par de clases reservadas.
  const clase = (nombre, dia) => db.prepare("SELECT id FROM class_sessions WHERE class_name = ? AND day_of_week = ?").get(nombre, dia);
  const reservar = db.prepare("INSERT OR IGNORE INTO bookings (user_id, session_id) VALUES (?, ?)");
  [["Spinning", "Lunes"], ["CrossTraining", "Miércoles"]].forEach(([n, d]) => {
    const c = clase(n, d);
    if (c) reservar.run(socio, c.id);
  });
  [["Spinning", "Lunes"], ["Yoga", "Martes"], ["Zumba", "Martes"]].forEach(([n, d], i) => {
    const c = clase(n, d);
    if (c) reservar.run(i % 2 ? ivan : nuria, c.id);
  });
}

module.exports = db;
