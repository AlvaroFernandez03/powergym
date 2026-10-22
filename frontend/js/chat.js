// js/chat.js
document.addEventListener("DOMContentLoaded", async () => {
  const notLogged = document.getElementById("not-logged");
  const chatBox = document.getElementById("chat-box");
  const messagesEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  if (!getToken()) {
    notLogged.classList.remove("hidden");
    return;
  }

  chatBox.classList.remove("hidden");

  function addMessage(role, content) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Cargar historial previo
  try {
    const history = await apiFetch("/chat/history");
    if (history.length === 0) {
      addMessage("assistant", "¡Hola! Soy tu entrenador personal virtual. Cuéntame tu objetivo y te iré guiando.");
    } else {
      history.forEach((m) => addMessage(m.role, m.content));
    }
  } catch (err) {
    notLogged.textContent = err.message;
    notLogged.classList.remove("hidden");
    chatBox.classList.add("hidden");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage("user", message);
    input.value = "";

    try {
      const data = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      addMessage("assistant", data.reply);
    } catch (err) {
      addMessage("assistant", "Ha ocurrido un error: " + err.message);
    }
  });
});
