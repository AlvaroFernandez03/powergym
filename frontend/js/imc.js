// js/imc.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("imc-form");
  const resultBox = document.getElementById("imc-result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const alturaCm = parseFloat(document.getElementById("altura").value);
    const peso = parseFloat(document.getElementById("peso").value);

    if (!alturaCm || !peso || alturaCm <= 0 || peso <= 0) {
      resultBox.textContent = "Introduce una altura y un peso válidos.";
      resultBox.classList.remove("hidden");
      return;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);

    let categoria;
    if (imc < 18.5) categoria = "Bajo peso";
    else if (imc < 25) categoria = "Peso normal";
    else if (imc < 30) categoria = "Sobrepeso";
    else categoria = "Obesidad";

    resultBox.innerHTML = `Tu IMC es <strong>${imc.toFixed(1)}</strong> — categoría: <strong>${categoria}</strong>`;
    resultBox.classList.remove("hidden");
  });
});
