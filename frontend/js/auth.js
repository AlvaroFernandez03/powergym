// js/auth.js
// Lógica compartida por TODAS las páginas: guarda el token en localStorage,
// actualiza la barra de navegación según si hay sesión iniciada, y expone
// una función apiFetch() que añade el token automáticamente a las peticiones.

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("gym_token");
}

function getStoredUser() {
  const raw = localStorage.getItem("gym_user");
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem("gym_token", token);
  localStorage.setItem("gym_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("gym_token");
  localStorage.removeItem("gym_user");
}

// Wrapper de fetch que añade el token automáticamente si existe
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error en la petición.");
  return data;
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

function isAdmin() {
  const user = getStoredUser();
  return !!user && user.role === "admin";
}

// Pinta el bloque de usuario en la navbar (Iniciar sesión / Registrarse vs Nombre + Cerrar sesión)
function renderNavUserArea() {
  const container = document.getElementById("nav-user-area");
  if (container) {
    const user = getStoredUser();
    if (user) {
      container.innerHTML = `
        <a href="area-personal.html" class="btn btn-outline">Hola, ${user.name}</a>
        <button id="logout-btn" class="btn btn-primary">Cerrar sesión</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", logout);
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn btn-outline">Iniciar sesión</a>
        <a href="registro.html" class="btn btn-primary">Registrarse</a>
      `;
    }
  }

  // Muestra el enlace "Admin" en el menú solo si el usuario logueado es administrador
  const adminLink = document.getElementById("nav-admin-link");
  if (adminLink) {
    adminLink.classList.toggle("hidden", !isAdmin());
  }
}

document.addEventListener("DOMContentLoaded", renderNavUserArea);
