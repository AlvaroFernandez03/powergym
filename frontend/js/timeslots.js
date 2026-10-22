// js/timeslots.js
// Lista compartida de horas y días. El panel de admin solo permite elegir estas horas
// al crear una clase, así encajan siempre en las filas del calendario semanal.

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Asigna un color de disco olímpico según el tipo de clase, como código visual de intensidad.
function plateColorForClass(className) {
  const name = className.toLowerCase();
  if (name.includes("spinning") || name.includes("cross") || name.includes("hiit")) return "red";
  if (name.includes("boxeo") || name.includes("zumba") || name.includes("baile")) return "blue";
  if (name.includes("pilates") || name.includes("fuerza")) return "yellow";
  if (name.includes("yoga") || name.includes("estirami")) return "green";
  return "yellow";
}
