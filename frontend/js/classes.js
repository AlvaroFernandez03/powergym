// js/classes.js
// Requiere que js/timeslots.js esté cargado antes (define TIME_SLOTS, WEEK_DAYS, plateColorForClass).

document.addEventListener("DOMContentLoaded", loadClasses);

async function loadClasses() {
  const container = document.getElementById("classes-list");
  container.innerHTML = "<p>Cargando horario...</p>";

  let sessions;
  try {
    const res = await fetch("/api/classes");
    sessions = await res.json();
  } catch (err) {
    container.innerHTML = `<p class="form-message error">No se pudo cargar el horario: ${err.message}</p>`;
    return;
  }

  let myBookings = [];
  if (getToken()) {
    try {
      myBookings = await apiFetch("/bookings/me");
    } catch (_) {
      myBookings = [];
    }
  }
  const bookedSessionIds = new Set(myBookings.map((b) => b.session_id));

  renderCalendar(container, sessions, bookedSessionIds);
}

function renderCalendar(container, sessions, bookedSessionIds) {
  // Agrupamos las clases por "día|hora" para poder colocarlas en la celda correcta.
  const byCell = {};
  sessions.forEach((s) => {
    const key = `${s.day_of_week}|${s.time_label}`;
    (byCell[key] = byCell[key] || []).push(s);
  });

  container.innerHTML = "";
  const scroll = document.createElement("div");
  scroll.className = "calendar-scroll";
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  // Cabecera: celda vacía + un encabezado por día
  grid.appendChild(makeCalCell("cal-head", ""));
  WEEK_DAYS.forEach((day) => grid.appendChild(makeCalCell("cal-head", day.slice(0, 3).toUpperCase())));

  // Filas: una por franja horaria
  TIME_SLOTS.forEach((time) => {
    grid.appendChild(makeCalCell("cal-time", time));

    WEEK_DAYS.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "cal-cell";

      const classesHere = byCell[`${day}|${time}`] || [];
      classesHere.forEach((s) => {
        cell.appendChild(makeClassChip(s, bookedSessionIds));
      });

      grid.appendChild(cell);
    });
  });

  scroll.appendChild(grid);
  container.appendChild(scroll);

  if (sessions.length === 0) {
    const empty = document.createElement("p");
    empty.style.marginTop = "16px";
    empty.textContent = "Todavía no hay clases programadas.";
    container.appendChild(empty);
  }

  // Wiring de los botones de reserva
  container.querySelectorAll("[data-session-id]").forEach((el) => {
    el.addEventListener("click", async () => {
      if (!getToken()) {
        window.location.href = "login.html";
        return;
      }
      if (el.classList.contains("is-booked") || el.classList.contains("is-full")) return;

      el.style.opacity = "0.6";
      try {
        await apiFetch("/bookings", {
          method: "POST",
          body: JSON.stringify({ session_id: Number(el.dataset.sessionId) }),
        });
        await loadClasses();
      } catch (err) {
        alert(err.message);
        el.style.opacity = "1";
      }
    });
  });
}

function makeCalCell(className, text) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  return div;
}

function makeClassChip(s, bookedSessionIds) {
  const isBooked = bookedSessionIds.has(s.id);
  const isFull = s.available_spots <= 0;
  const plateColor = plateColorForClass(s.class_name);

  const chip = document.createElement("div");
  chip.className = `cal-class plate-${plateColor}`;
  chip.dataset.sessionId = s.id;

  let stateLabel;
  if (isBooked) {
    chip.classList.add("is-booked");
    stateLabel = "Reservada ✓";
  } else if (isFull) {
    chip.classList.add("is-full");
    stateLabel = "Sin plazas";
  } else {
    chip.classList.add("is-clickable");
    stateLabel = `${s.available_spots} plazas libres`;
  }

  chip.innerHTML = `
    <span class="cal-class-name">${s.class_name}</span>
    <span class="cal-class-meta">${s.monitor_name || "—"} · ${stateLabel}</span>
  `;
  chip.title = isBooked
    ? "Ya tienes reserva en esta clase"
    : isFull
    ? "No quedan plazas"
    : getToken()
    ? "Toca para reservar"
    : "Inicia sesión para reservar";

  return chip;
}
