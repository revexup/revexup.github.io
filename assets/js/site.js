/* Revexup · comportamiento del sitio (v3): menú móvil, aparición suave y la hoja de cotización viva de la portada. */
(function () {
  "use strict";

  // Menú móvil: se cierra al elegir una opción.
  document.querySelectorAll(".menu a").forEach(function (a) {
    a.addEventListener("click", function () { var d = a.closest("details"); if (d) d.removeAttribute("open"); });
  });

  // Aparición suave al hacer scroll.
  var els = document.querySelectorAll(".reveal");
  var showAll = function () { els.forEach(function (el) { el.classList.add("in"); }); };
  // Lo que ya se ve al cargar aparece de inmediato; y nada se queda oculto si el navegador no avisa del scroll.
  els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); });
  setTimeout(showAll, 2500);
  if ("IntersectionObserver" in window && els.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add("in"); }); }

  // Hoja viva: elegir clave o cambiar cantidad recalcula todo, como en la plantilla real.
  var sheet = document.getElementById("demo-sheet");
  if (!sheet) return;
  var CAT = {
    "CAB-12": ["Cable THW cal. 12, rollo 100 m", 1890],
    "CON-2": ["Contacto doble polarizado", 45.5],
    "APA-1": ["Apagador sencillo", 38],
    "FOC-9": ["Foco LED 9 W, luz blanca", 42],
    "TUB-34": ["Tubo conduit 3/4\", tramo 3 m", 96],
    "CIN-19": ["Cinta de aislar 19 mm", 22.5],
    "CHA-1": ["Caja chalupa galvanizada", 9.8],
    "INT-20": ["Interruptor termomagnético 20 A", 185]
  };
  var IVA = 0.16;
  var money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
  var ref = sheet.querySelector(".fx-bar .ref"), fx = sheet.querySelector(".fx-bar .f");
  var rows = Array.prototype.slice.call(sheet.querySelectorAll("tr[data-row]"));

  function cell(row, k) { return row.querySelector('[data-k="' + k + '"]'); }
  function flash(el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
  function set(el, txt, anim) { if (el.textContent !== txt) { el.textContent = txt; if (anim) flash(el); } }

  function calc(anim) {
    var sub = 0;
    rows.forEach(function (r) {
      var key = r.querySelector("select").value, qty = Math.max(0, parseFloat(r.querySelector("input").value) || 0);
      var p = CAT[key] || ["", 0];
      set(cell(r, "desc"), p[0], anim);
      set(cell(r, "precio"), money.format(p[1]), anim);
      var imp = Math.round(p[1] * qty * 100) / 100;
      set(cell(r, "imp"), money.format(imp), anim);
      sub += imp;
    });
    var iva = Math.round(sub * IVA * 100) / 100;
    set(sheet.querySelector('[data-k="sub"]'), money.format(sub), anim);
    set(sheet.querySelector('[data-k="iva"]'), money.format(iva), anim);
    set(sheet.querySelector('[data-k="total"]'), money.format(sub + iva), anim);
  }

  // Barra de fórmulas: muestra lo que hay detrás de cada celda.
  sheet.querySelectorAll("[data-ref]").forEach(function (el) {
    var show = function () {
      ref.textContent = el.getAttribute("data-ref");
      fx.textContent = el.getAttribute("data-f");
      sheet.querySelectorAll("td.sel").forEach(function (t) { t.classList.remove("sel"); });
      var td = el.closest("td"); if (td && !td.classList.contains("cell-in")) td.classList.add("sel");
    };
    el.addEventListener("mouseenter", show);
    el.addEventListener("focus", show);
    el.addEventListener("click", show);
  });

  sheet.addEventListener("change", function () { calc(true); });
  sheet.addEventListener("input", function (e) { if (e.target.tagName === "INPUT") calc(true); });
  calc(false);
})();
