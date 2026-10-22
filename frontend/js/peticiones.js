// js/peticiones.js
document.addEventListener("DOMContentLoaded", async () => {
  const notLogged = document.getElementById("not-logged");
  const formSection = document.getElementById("request-form-section");
  const listEl = document.getElementById("requests-list");

  if (!getToken()) {
    notLogged.classList.remove("hidden");
    return;
  }
  formSection.classList.remove("hidden");

  async function loadRequests() {
    listEl.innerHTML = "<p>Cargando peticiones...</p>";
    try {
      const requests = await apiFetch("/requests");
      const me = getStoredUser();

      if (requests.length === 0) {
        listEl.innerHTML = "<p>Todavía no hay peticiones. ¡Sé el primero en escribir una!</p>";
        return;
      }

      listEl.innerHTML = "";
      requests.forEach((r) => {
        const canDelete = me && (me.id === r.user_id || isAdmin());
        const card = document.createElement("div");
        card.className = "card";
        card.style.marginBottom = "12px";
        card.innerHTML = `
          <p style="font-weight:600; margin-bottom:6px;">${r.user_name}</p>
          <p>${r.message}</p>
          <p style="color:var(--color-muted); font-size:0.8rem; margin-top:6px;">${new Date(r.created_at).toLocaleString("es-ES")}</p>
          ${canDelete ? `<button class="btn btn-outline" data-request-id="${r.id}" style="margin-top:8px;">Borrar</button>` : ""}
        `;
        listEl.appendChild(card);
      });

      listEl.querySelectorAll("button[data-request-id]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("¿Seguro que quieres borrar esta petición?")) return;
          try {
            await apiFetch(`/requests/${btn.dataset.requestId}`, { method: "DELETE" });
            await loadRequests();
          } catch (err) {
            alert(err.message);
          }
        });
      });
    } catch (err) {
      listEl.innerHTML = `<p class="form-message error">${err.message}</p>`;
    }
  }

  document.getElementById("request-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("request-message");
    const msg = document.getElementById("request-form-msg");
    msg.textContent = "";
    msg.className = "form-message";

    try {
      await apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify({ message: input.value.trim() }),
      });
      input.value = "";
      await loadRequests();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add("error");
    }
  });

  await loadRequests();
});
