// services/email.js
//
// Envío de emails transaccionales con Resend. Si no has configurado RESEND_API_KEY
// en tu .env, este módulo simplemente no envía nada (y lo avisa por consola una vez),
// para que el resto de la web funcione con normalidad aunque no hayas montado el email.

const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = "PowerGym <onboarding@resend.dev>";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

let warnedOnce = false;
function warnIfNotConfigured() {
  if (!resend && !warnedOnce) {
    console.log("ℹ️  RESEND_API_KEY no configurada: los emails no se enviarán (ver README).");
    warnedOnce = true;
  }
}

function wrapEmailHtml(title, bodyHtml) {
  return `
  <div style="font-family: Arial, sans-serif; background:#E7E4DC; padding:32px;">
    <div style="max-width:480px; margin:0 auto; background:#F6F4EE; border-radius:10px; overflow:hidden; border-top:5px solid #D91C3C;">
      <div style="background:#171614; color:#F6F4EE; padding:20px 28px;">
        <span style="font-size:20px; font-weight:bold; letter-spacing:0.03em;">POWER<span style="color:#D91C3C;">GYM</span></span>
      </div>
      <div style="padding:28px;">
        <h1 style="font-size:20px; color:#1B1B18; margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="background:#171614; color:#6B685F; text-align:center; padding:16px; font-size:11px; letter-spacing:0.04em;">
        POWERGYM — PROYECTO DE PRÁCTICA / PORTFOLIO
      </div>
    </div>
  </div>`;
}

async function sendWelcomeEmail(user) {
  warnIfNotConfigured();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: [user.email],
      subject: "¡Bienvenido a PowerGym! 🏋️",
      html: wrapEmailHtml(
        `¡Bienvenido, ${user.name}!`,
        `<p style="color:#3f3d38; line-height:1.6;">
           Tu cuenta ya está lista. Ya puedes reservar clases, hablar con tu entrenador IA
           y consultar tu área personal.
         </p>
         <a href="${FRONTEND_URL}/clases.html"
            style="display:inline-block; margin-top:14px; background:#D91C3C; color:#F6F4EE;
                   padding:12px 22px; border-radius:4px; text-decoration:none; font-weight:600;
                   font-size:13px; letter-spacing:0.05em; text-transform:uppercase;">
           Ver clases disponibles
         </a>`
      ),
    });
  } catch (err) {
    console.error("No se pudo enviar el email de bienvenida:", err.message);
  }
}

async function sendBookingConfirmation(user, session) {
  warnIfNotConfigured();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: [user.email],
      subject: `Reserva confirmada: ${session.class_name} (${session.day_of_week})`,
      html: wrapEmailHtml(
        "Reserva confirmada ✅",
        `<p style="color:#3f3d38; line-height:1.6;">Hola ${user.name}, tu plaza ha quedado reservada:</p>
         <table style="width:100%; margin:16px 0; font-size:14px; color:#1B1B18;">
           <tr><td style="padding:4px 0; color:#6B685F;">Clase</td><td style="text-align:right; font-weight:600;">${session.class_name}</td></tr>
           <tr><td style="padding:4px 0; color:#6B685F;">Día</td><td style="text-align:right;">${session.day_of_week}</td></tr>
           <tr><td style="padding:4px 0; color:#6B685F;">Hora</td><td style="text-align:right;">${session.time_label}</td></tr>
           <tr><td style="padding:4px 0; color:#6B685F;">Monitor</td><td style="text-align:right;">${session.monitor_name || "Por confirmar"}</td></tr>
         </table>
         <p style="color:#3f3d38; line-height:1.6; font-size:13px;">
           ¿Necesitas cancelarla? Hazlo en cualquier momento desde tu área personal.
         </p>
         <a href="${FRONTEND_URL}/area-personal.html"
            style="display:inline-block; margin-top:10px; background:#D91C3C; color:#F6F4EE;
                   padding:12px 22px; border-radius:4px; text-decoration:none; font-weight:600;
                   font-size:13px; letter-spacing:0.05em; text-transform:uppercase;">
           Gestionar mis reservas
         </a>`
      ),
    });
  } catch (err) {
    console.error("No se pudo enviar el email de confirmación de reserva:", err.message);
  }
}

module.exports = { sendWelcomeEmail, sendBookingConfirmation };
