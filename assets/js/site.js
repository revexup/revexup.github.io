/* Revexup · comportamiento del sitio (v4, el talonario): menú móvil, la cotización que se llena sola
   y la solicitud de demo que abre el correo del visitante ya escrito. */
(function () {
  "use strict";

  // Menú móvil: se cierra al elegir una opción.
  document.querySelectorAll(".menu a").forEach(function (a) {
    a.addEventListener("click", function () { var d = a.closest("details"); if (d) d.removeAttribute("open"); });
  });

  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- La cotización viva ----------
  var sheet = document.getElementById("demo-sheet");
  if (sheet) {
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
    var ref = sheet.querySelector(".t-fx .ref"), fx = sheet.querySelector(".t-fx .f");
    var copia = document.querySelector('[data-k="copia"]');
    var rows = Array.prototype.slice.call(sheet.querySelectorAll("tr[data-row]"));
    var lleno = false;

    var cell = function (row, k) { return row.querySelector('[data-k="' + k + '"]'); };
    var flash = function (el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); };
    var set = function (el, txt, anim) { if (el && el.textContent !== txt) { el.textContent = txt; if (anim) flash(el); } };

    var importe = function (r) {
      var key = r.querySelector("select").value, qty = Math.max(0, parseFloat(r.querySelector("input").value) || 0);
      var p = CAT[key] || ["", 0];
      return { p: p, imp: Math.round(p[1] * qty * 100) / 100 };
    };
    var llenaRenglon = function (r, anim) {
      var x = importe(r);
      set(cell(r, "desc"), x.p[0], anim);
      set(cell(r, "precio"), money.format(x.p[1]), anim);
      set(cell(r, "imp"), money.format(x.imp), anim);
    };
    var totales = function (anim) {
      var sub = rows.reduce(function (s, r) { return s + importe(r).imp; }, 0);
      var iva = Math.round(sub * IVA * 100) / 100;
      set(sheet.querySelector('[data-k="sub"]'), money.format(sub), anim);
      set(sheet.querySelector('[data-k="iva"]'), money.format(iva), anim);
      set(sheet.querySelector('[data-k="total"]'), money.format(sub + iva), anim);
      if (copia) copia.textContent = "Total " + money.format(sub + iva);
    };

    // La hoja ya viene llena en el HTML (sin JS, en el celular o en una captura nunca se ve vacía).
    // Al aparecer en pantalla, la máquina la vuelve a llenar renglón por renglón: es el único momento orquestado.
    var llenarConMaquina = function () {
      if (lleno) return;
      lleno = true;
      if (quieto) return;
      var vacias = sheet.querySelectorAll('[data-k="desc"],[data-k="precio"],[data-k="imp"],[data-k="sub"],[data-k="iva"],[data-k="total"]');
      Array.prototype.forEach.call(vacias, function (el) { el.textContent = ""; });
      rows.forEach(function (r, i) { setTimeout(function () { llenaRenglon(r, true); }, 180 + i * 300); });
      setTimeout(function () { totales(true); }, 180 + rows.length * 300);
    };
    if ("IntersectionObserver" in window && !quieto) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); llenarConMaquina(); }
      }, { threshold: 0.35 });
      io.observe(sheet);
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

    var recalcula = function (e) {
      var r = e.target.closest("tr[data-row]");
      if (r) llenaRenglon(r, !quieto);
      totales(!quieto);
    };
    sheet.addEventListener("change", recalcula);
    sheet.addEventListener("input", function (e) { if (e.target.tagName === "INPUT") recalcula(e); });
  }

  // ---------- Solicitud de demo: abre el correo del visitante con todo escrito ----------
  var form = document.getElementById("solicitud");
  if (form) {
    var campo = function (name) { return form.elements[name]; };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["negocio", "tarea"].forEach(function (n) {
        var el = campo(n), box = el.closest(".campo"), vacio = !el.value.trim();
        box.classList.toggle("mal", vacio);
        el.setAttribute("aria-invalid", vacio ? "true" : "false");
        if (vacio && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      var prog = (form.querySelector('input[name="programa"]:checked') || {}).value || "No sé";
      var negocio = campo("negocio").value.trim();
      var cuerpo = "Hola, quiero una demo gratis.\n\n" +
        "Negocio: " + negocio + "\n" +
        "Lo uso en: " + prog + "\n\n" +
        "Qué hago hoy a mano:\n" + campo("tarea").value.trim() + "\n\n" +
        "(Si quieres, adjunta un ejemplo de tu archivo o una foto de tu lista de precios; puede ser con datos ficticios.)";
      var email = (window.REVEXUP && window.REVEXUP.email) || "";
      window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent("Solicitud de demo · " + negocio) +
        "&body=" + encodeURIComponent(cuerpo);
    });
    form.addEventListener("input", function (e) {
      var box = e.target.closest(".campo");
      if (box && box.classList.contains("mal") && e.target.value.trim()) { box.classList.remove("mal"); e.target.setAttribute("aria-invalid", "false"); }
    });
  }
})();
