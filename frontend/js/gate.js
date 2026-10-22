// js/gate.js
document.addEventListener("DOMContentLoaded", () => {
  // Si ya hay sesión iniciada, no repetimos la animación: pasamos directos.
  if (getToken()) {
    window.location.href = "inicio.html";
    return;
  }

  const gate = document.getElementById("gate");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("gate-login-form");
  const formRegister = document.getElementById("gate-register-form");

  function showTab(tab) {
    const isLogin = tab === "login";
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    formLogin.classList.toggle("hidden", !isLogin);
    formRegister.classList.toggle("hidden", isLogin);
  }
  tabLogin.addEventListener("click", () => showTab("login"));
  tabRegister.addEventListener("click", () => showTab("register"));

  function openDoors() {
    gate.classList.add("is-open");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 950;
    setTimeout(() => {
      window.location.href = "inicio.html";
    }, delay);
  }

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("gate-login-msg");
    msg.textContent = "";
    msg.className = "form-message";

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: document.getElementById("gate-login-email").value.trim(),
          password: document.getElementById("gate-login-password").value,
        }),
      });
      saveSession(data.token, data.user);
      openDoors();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add("error");
    }
  });

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("gate-register-msg");
    msg.textContent = "";
    msg.className = "form-message";

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("gate-register-name").value.trim(),
          email: document.getElementById("gate-register-email").value.trim(),
          password: document.getElementById("gate-register-password").value,
        }),
      });
      saveSession(data.token, data.user);
      openDoors();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add("error");
    }
  });
});
