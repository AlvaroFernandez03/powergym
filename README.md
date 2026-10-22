# PowerGym — Proyecto de práctica / portfolio

Página web de gimnasio con backend real: login con base de datos, reservas de clases con
calendario semanal, panel de administrador, entrenador IA (simulado), peticiones de usuarios,
carruseles de fotos en monitores/instalaciones, emails de bienvenida y confirmación de
reserva, y una puerta de entrada animada como landing.

## Demo en vivo

**[alvarofo-powergym.onrender.com](https://alvarofo-powergym.onrender.com)** · forma parte de mi portfolio: **[alvarofernandez03.github.io](https://alvarofernandez03.github.io/)**

Dentro tienes una cinta con las cuentas de prueba para entrar con un clic
(contraseña de todas: `powergym123`):

| Cuenta | Email |
|---|---|
| Socio del gimnasio | `socio@powergym.com` |
| Administración (gestiona las clases) | `admin@powergym.com` |

Está en el plan gratuito de Render: si nadie la ha usado en un rato, tarda
hasta un minuto en despertar. Los datos son de ejemplo y se reinician solos
cada vez que despierta, así que puedes tocar lo que quieras.

Las cuentas de prueba, las peticiones del tablón y algunas reservas solo se crean en la demo (`DEMO=1`, en `backend/db/database.js`).

<details>
<summary>Cómo funciona el modo demo</summary>

La demo pública arranca con la variable `DEMO=1`. Con ella, `backend/demo.js`
añade la cinta con las cuentas de prueba a cada página y bloquea lo que
dejaría fuera a las siguientes visitas (cambiar la contraseña de una cuenta de
prueba, desactivarla...). Sin `DEMO=1`, en tu ordenador, la app funciona
exactamente igual que siempre. La configuración de Render está en el
`render.yaml` del [repositorio del portfolio](https://github.com/AlvaroFernandez03/AlvaroFernandez03.github.io).

</details>

## Estructura

```
gym-website/
├── backend/                -> API Node.js + Express + SQLite
│   ├── db/                   -> base de datos SQLite (se crea sola al arrancar)
│   ├── routes/                -> auth, users, chat, classes, bookings, requests
│   ├── middleware/             -> verificación de token JWT y de rol admin
│   ├── services/email.js       -> envío de emails con Resend (opcional)
│   └── server.js                -> servidor principal (también sirve el frontend)
└── frontend/                -> HTML + CSS + JS (vanilla)
    ├── index.html              -> puerta de entrada (login / registro / invitado)
    ├── inicio.html              -> home real de la web
    ├── clases.html               -> calendario semanal + reservas
    ├── monitores.html             -> fichas de monitores con carrusel de fotos
    ├── instalaciones.html          -> fichas de instalaciones con carrusel de fotos
    ├── programas.html, imc.html, peticiones.html, entrenador-ia.html
    ├── area-personal.html          -> perfil + "mis reservas"
    ├── admin.html                   -> gestión de clases (solo administrador)
    └── login.html / registro.html    -> páginas alternativas de acceso directo
```

## Cómo ejecutarlo en tu ordenador

Necesitas [Node.js](https://nodejs.org) **versión 22.5 o superior** (usa el módulo SQLite
integrado en Node, sin dependencias nativas que compilar).

1. Dentro de la carpeta `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Copia `.env.example` como `.env` y rellena al menos `JWT_SECRET` y `ADMIN_EMAIL`.
3. Arranca el servidor:
   ```bash
   npm start
   ```
4. Abre tu navegador en **http://localhost:3000** — verás primero la puerta del gimnasio.

## Cómo convertirte en administrador

Pon tu email en `ADMIN_EMAIL` dentro de `.env`. La próxima vez que te registres (o inicies
sesión, si ya tenías cuenta) tu cuenta pasa automáticamente a rol "admin" y verás el enlace
"Admin" en el menú, desde donde puedes crear/editar/borrar clases — aparecen al momento en
el calendario semanal de `clases.html`.

## Cómo activar los emails (opcional)

Sin configurar nada, la web funciona igual mas no se envían emails. Para activarlos:

1. Crea una cuenta gratuita en [resend.com](https://resend.com)
2. Genera una API key y ponla en `RESEND_API_KEY` dentro de `.env`
3. Reinicia el servidor (`npm start`)

Con eso ya se envía automáticamente:
- Un email de bienvenida al registrarte
- Un email de confirmación cada vez que reservas una clase, con un enlace a "Mis reservas"

**Importante**: sin verificar un dominio propio en Resend (gratis, pero requiere tener un
dominio), solo podrás enviar emails a la dirección con la que te registraste en Resend. Es
perfecto para probarlo tú mismo; si algún día quieres que le llegue a cualquier usuario real,
tendrás que verificar un dominio en el panel de Resend.

## Qué es ya funcional

- ✅ **Puerta de entrada** (`index.html`): login/registro integrado con animación de apertura
  de puertas; si ya tienes sesión iniciada, entras directo sin repetirla
- ✅ Navegación completa: Inicio, Clases, Monitores, Programas, IMC, Entrenador IA,
  Peticiones, Instalaciones
- ✅ Calculadora de IMC funcionando 100% en el navegador
- ✅ Registro e inicio de sesión reales, contraseñas cifradas (bcrypt) y tokens (JWT)
- ✅ Base de datos SQLite real (`backend/db/gym.db`)
- ✅ Área personal con perfil físico y objetivo, y listado de "mis reservas"
- ✅ Entrenador IA: chat simulado por palabras clave, con historial por usuario
- ✅ **Calendario semanal de clases**: rejilla días × horas, con reserva/cancelación y
  código de color por intensidad (rojo/azul/amarillo/verde, como los discos olímpicos)
- ✅ **Peticiones**: cualquier usuario registrado escribe y ve las de todos
- ✅ **Monitores e instalaciones**: ficha profesional con carrusel de 3 fotos, especialidad,
  experiencia/certificaciones y descripción por cada uno
- ✅ **Panel de administrador**: crear, editar y borrar clases (se reflejan al momento
  en el calendario público)
- ✅ **Emails automáticos** (opcionales): bienvenida al registrarte, confirmación al reservar
- ✅ Identidad visual propia: paleta y tipografía con estética "sala de pesas"

## Próximos pasos (ideas para seguir)

1. Conectar el entrenador IA a una IA real (sustituir `generateSimulatedReply()` en
   `backend/routes/chat.js` por una llamada a la API de Claude u otra).
2. Sustituir las fotos de muestra por fotos reales del gimnasio.
3. Verificar un dominio en Resend para poder enviar emails a cualquier usuario real.
4. Recordatorio automático antes de cada clase (requeriría un proceso programado/cron).
5. Lista de espera automática cuando una clase está completa.
6. Notificaciones push del navegador, como capa adicional a los emails.

## Notas de seguridad para cuando lo publiques

- Cambia `JWT_SECRET` en `.env` por algo largo y aleatorio, y no subas nunca `.env` a un
  repositorio público (ya está en `.gitignore`).
- Antes de publicarlo de verdad conviene añadir validaciones extra, límites de peticiones
  (rate limiting) y HTTPS.
