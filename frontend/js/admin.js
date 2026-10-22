// js/admin.js
let editingId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const noAccess = document.getElementById("no-access");
  const panel = document.getElementById("admin-panel");

  // Rellenamos los desplegables de día y hora con las constantes compartidas (js/timeslots.js)
  const daySelect = document.getElementById("c-day");
  daySelect.innerHTML = WEEK_DAYS.map((d) => `<option value="${d}">${d}</option>`).join("");
  const timeSelect = document.getElementById("c-time");
  timeSelect.innerHTML = TIME_SLOTS.map((t) => `<option value="${t}">${t}</option>`).join("");

  if (!getToken() || !isAdmin()) {
    noAccess.classList.remove("hidden");
    return;
  }
  panel.classList.remove("hidden");

  await loadAdminClasses();

  document.getElementById("class-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("class-form-msg");
    msg.textContent = "";
    msg.className = "form-message";

    const payload = {
      class_name: document.getElementById("c-name").value.trim(),
      day_of_week: document.getElementById("c-day").value,
      time_label: document.getElementById("c-time").value.trim(),
      monitor_name: document.getElementById("c-monitor").value.trim(),
      capacity: document.getElementById("c-capacity").value,
    };

    try {
      if (editingId) {
        await apiFetch(`/classes/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        msg.textContent = "Clase actualizada correctamente.";
      } else {
        await apiFetch("/classes", { method: "POST", body: JSON.stringify(payload) });
        msg.textContent = "Clase creada correctamente.";
      }
      msg.classList.add("success");
      resetForm();
      await loadAdminClasses();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add("error");
    }
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", resetForm);
});

function resetForm() {
  editingId = null;
  document.getElementById("class-form").reset();
  document.getElementById("form-title").textContent = "Añadir nueva clase";
  document.getElementById("cancel-edit-btn").classList.add("hidden");
}

async function loadAdminClasses() {
  const list = document.getElementById("admin-classes-list");
  list.innerHTML = "<p>Cargando clases...</p>";

  try {
    const res = await fetch("/api/classes");
    const sessions = await res.json();

    if (sessions.length === 0) {
      list.innerHTML = "<p>No hay clases creadas todavía.</p>";
      return;
    }

    list.innerHTML = "";
    sessions.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.marginBottom = "12px";
      card.innerHTML = `
        <h3>${s.class_name}</h3>
        <p>${s.day_of_week} — ${s.time_label} · Monitor: ${s.monitor_name || "—"}</p>
        <p>Reservadas: ${s.booked_count} / ${s.capacity}</p>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn btn-outline" data-edit-id="${s.id}">Editar</button>
          <button class="btn btn-outline" data-delete-id="${s.id}">Borrar</button>
        </div>
      `;
      list.appendChild(card);

      card.querySelector("[data-edit-id]").addEventListener("click", () => {
        editingId = s.id;
        document.getElementById("c-name").value = s.class_name;
        document.getElementById("c-day").value = s.day_of_week;
        document.getElementById("c-time").value = s.time_label;
        document.getElementById("c-monitor").value = s.monitor_name || "";
        document.getElementById("c-capacity").value = s.capacity;
        document.getElementById("form-title").textContent = `Editando: ${s.class_name}`;
        document.getElementById("cancel-edit-btn").classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      card.querySelector("[data-delete-id]").addEventListener("click", async () => {
        if (!confirm(`¿Borrar la clase "${s.class_name}"? También se cancelarán sus reservas.`)) return;
        try {
          await apiFetch(`/classes/${s.id}`, { method: "DELETE" });
          await loadAdminClasses();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    list.innerHTML = `<p class="form-message error">${err.message}</p>`;
  }
}
