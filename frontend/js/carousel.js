// js/carousel.js
// Autoinicializa cualquier bloque .carousel presente en la página. Estructura esperada:
// <div class="carousel">
//   <div class="carousel-track">
//     <img class="carousel-slide active" src="..."> ...
//   </div>
//   <button class="carousel-btn carousel-prev">‹</button>
//   <button class="carousel-btn carousel-next">›</button>
//   <div class="carousel-dots"><button class="dot active"></button> ...</div>
// </div>

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".carousel").forEach(initCarousel);
});

function initCarousel(root) {
  const slides = Array.from(root.querySelectorAll(".carousel-slide"));
  const dots = Array.from(root.querySelectorAll(".carousel-dots .dot"));
  const prevBtn = root.querySelector(".carousel-prev");
  const nextBtn = root.querySelector(".carousel-next");
  if (slides.length === 0) return;

  let current = Math.max(0, slides.findIndex((s) => s.classList.contains("active")));

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  // Autoplay suave, en pausa si el usuario prefiere menos movimiento o pasa el ratón por encima
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion && slides.length > 1) {
    let timer = setInterval(() => goTo(current + 1), 4500);
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", () => {
      timer = setInterval(() => goTo(current + 1), 4500);
    });
  }
}
