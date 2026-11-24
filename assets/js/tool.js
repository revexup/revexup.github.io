(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  // Qué se agradece según el giro
  var GIRO = {
    general:     { u: "su visita", t: "tu visita", cosa: "la atención" },
    restaurante: { u: "su visita", t: "tu visita", cosa: "la comida y la atención" },
    salud:       { u: "su consulta", t: "tu consulta", cosa: "la atención en su consulta" },
    taller:      { u: "el servicio a su vehículo", t: "el servicio a tu vehículo", cosa: "el servicio" },
    belleza:     { u: "su cita", t: "tu cita", cosa: "el resultado" },
    tienda:      { u: "su compra", t: "tu compra", cosa: "su compra" },
    servicios:   { u: "su confianza", t: "tu confianza", cosa: "la asesoría" },
    hogar:       { u: "el servicio en su casa", t: "el servicio en tu casa", cosa: "el trabajo" }
  };

  function normalizeLink(raw) {
    var v = (raw || "").trim();
    if (!v) return null;
    if (/^[A-Za-z0-9_-]{20,}$/.test(v) && /^(ChIJ|GhIJ|Ei|EhI)/.test(v)) {
      return "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(v);
    }
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    try {
      var u = new URL(v);
      var ok = /(^|\.)google\.[a-z.]+$/i.test(u.hostname) || /(^|\.)g\.page$/i.test(u.hostname) ||
               /(^|\.)goo\.gl$/i.test(u.hostname) || /(^|\.)revexup\.com$/i.test(u.hostname);
      if (!ok) return { error: "Ese enlace no parece de Google. Usa el enlace de 'Pedir reseñas' de tu perfil o tu Place ID." };
      return u.toString();
    } catch (e) { return { error: "El enlace no es válido. Revísalo y vuelve a intentar." }; }
  }

  function messages(biz, link, giro, trato) {
    var g = GIRO[giro] || GIRO.general;
    if (trato === "tu") return [
      "¡Hola! Gracias por " + g.t + " en " + biz + " 😊\n¿Nos ayudas con una reseña en Google? Son 10 segundos y nos ayuda muchísimo:\n" + link,
      "Hola, ¿cómo te fue con " + g.cosa + "? Si te gustó, ¿nos dejarías tu opinión en Google? Aquí va directo:\n" + link + "\n¡Gracias!",
      "¡Gracias por elegirnos! En " + biz + " somos un negocio local y cada reseña nos ayuda a que más gente nos encuentre. ¿Nos regalas una?\n" + link,
      "Hola 👋 Solo para saber cómo te fue. Si tienes un minuto, tu reseña en Google nos ayuda mucho: " + link,
      "Recordatorio rápido: si aún no nos dejas tu reseña, aquí está el enlace. ¡Gracias por tu apoyo! 🙌\n" + link
    ];
    return [
      "Hola, gracias por " + g.u + " en " + biz + ".\n¿Nos ayudaría con una reseña en Google? Toma 10 segundos y nos ayuda mucho:\n" + link,
      "Buen día. ¿Cómo le fue con " + g.cosa + "? Si quedó satisfecho, le agradeceríamos mucho su opinión en Google:\n" + link,
      "Gracias por su confianza. En " + biz + " somos un negocio local y cada reseña nos ayuda a que más personas nos encuentren. ¿Nos regala una?\n" + link,
      "Hola, solo para saber cómo le fue. Si tiene un minuto, su reseña en Google nos ayuda mucho: " + link,
      "Un recordatorio amable: si aún no nos deja su reseña, aquí está el enlace. ¡Muchas gracias por su apoyo!\n" + link
    ];
  }

  var state = { link: "", biz: "", qr: null };

  function makeQR(text) {
    var q = qrcode(0, "M");
    q.addData(text, "Byte");
    q.make();
    return q;
  }

  function qrSVG(q, cell, margin) {
    return q.createSvgTag({ cellSize: cell || 8, margin: margin == null ? 2 : margin, scalable: true });
  }

  function download(name, blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function slug(s) {
    return (s || "negocio").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "negocio";
  }

  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = "¡Copiado!"; setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    else fallback();
    function fallback() { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch (e) {} t.remove(); }
  }

  function render() {
    var biz = $("biz").value.trim(), giro = $("giro").value, trato = $("trato").value;
    var err = $("err"); err.classList.add("hidden");
    if (!biz) { err.textContent = "Escribe el nombre de tu negocio."; err.classList.remove("hidden"); return; }
    var link = normalizeLink($("link").value);
    if (!link) { err.textContent = "Pega tu enlace de reseñas o tu Place ID."; err.classList.remove("hidden"); return; }
    if (typeof link === "object") { err.textContent = link.error; err.classList.remove("hidden"); return; }

    state = { link: link, biz: biz, qr: makeQR(link) };
    $("qr").innerHTML = qrSVG(state.qr, 8, 1);
    $("pBiz").textContent = biz;
    $("pTitle").textContent = trato === "tu" ? "¿Te gustó tu visita?" : "¿Le gustó su visita?";
    $("pSteps").innerHTML = (trato === "tu"
      ? "Abre la cámara, apunta al código y toca las estrellas. Tarda 10 segundos."
      : "Abra la cámara, apunte al código y toque las estrellas. Tarda 10 segundos.") + "<br><b>¡Gracias!</b>";

    var box = $("msgs"); box.innerHTML = "";
    messages(biz, link, giro, trato).forEach(function (m, i) {
      var d = document.createElement("div");
      var p = document.createElement("div"); p.className = "msg"; p.textContent = m;
      var act = document.createElement("div"); act.className = "msg-actions";
      var b1 = document.createElement("button"); b1.type = "button"; b1.className = "btn btn-ghost btn-sm"; b1.textContent = "Copiar";
      b1.onclick = function () { copy(m, b1); };
      var b2 = document.createElement("a"); b2.className = "btn btn-wa btn-sm"; b2.textContent = "Abrir en WhatsApp";
      b2.href = "https://wa.me/?text=" + encodeURIComponent(m); b2.target = "_blank"; b2.rel = "noopener";
      act.appendChild(b1); act.appendChild(b2);
      var h = document.createElement("div"); h.className = "fine"; h.textContent = ["Al terminar el servicio", "Al día siguiente", "Para clientes frecuentes", "Corto y casual", "Recordatorio (solo una vez)"][i];
      d.appendChild(h); d.appendChild(p); d.appendChild(act); box.appendChild(d);
    });

    $("empty").classList.add("hidden");
    $("out").classList.remove("hidden");
    if (window.innerWidth < 900) $("out").scrollIntoView({ behavior: "smooth" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("f").addEventListener("submit", function (e) { e.preventDefault(); render(); });

    document.querySelectorAll(".tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".tabs button").forEach(function (x) { x.setAttribute("aria-selected", "false"); });
        b.setAttribute("aria-selected", "true");
        $("poster").className = "poster " + b.getAttribute("data-theme");
      });
    });

    $("print").addEventListener("click", function () { window.print(); });
    $("copyLink").addEventListener("click", function () { if (state.link) copy(state.link, this); });
    $("svg").addEventListener("click", function () {
      if (!state.qr) return;
      download("qr-resenas-" + slug(state.biz) + ".svg", new Blob([qrSVG(state.qr, 10, 2)], { type: "image/svg+xml" }));
    });
    $("png").addEventListener("click", function () {
      if (!state.qr) return;
      var n = state.qr.getModuleCount(), m = 4, size = 1200, cell = Math.floor(size / (n + m * 2));
      var c = document.createElement("canvas"); c.width = c.height = cell * (n + m * 2);
      var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.fillStyle = "#000";
      for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (state.qr.isDark(r, k)) x.fillRect((k + m) * cell, (r + m) * cell, cell, cell);
      c.toBlob(function (b) { download("qr-resenas-" + slug(state.biz) + ".png", b); }, "image/png");
    });

    // Prellenar desde la URL: /herramienta/?n=Negocio&l=ChIJ...
    var q = new URLSearchParams(location.search);
    if (q.get("n")) $("biz").value = q.get("n");
    if (q.get("l")) $("link").value = q.get("l");
    if (q.get("n") && q.get("l")) render();
  });
})();
