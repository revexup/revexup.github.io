// Configuración central de Revexup. Cambiar aquí = cambia en todo el sitio.
window.REVEXUP = {
  site: "https://revexup.com",
  email: "vd561838@gmail.com",          // atención al cliente
  whatsapp: "",                          // ej. "5215512345678" (sin +). Vacío = se ocultan los botones de WhatsApp
  // PayPal: cobro con el correo de la cuenta PayPal (no necesita botón ni API).
  paypalEmail: "vd561838@gmail.com",
  // back: a dónde vuelve el comprador tras pagar; cancel: si cancela.
  products: {
    cotizador:  { name: "Revexup - Plantilla Cotizador automatico (Excel)",       amount: "15.00", currency: "USD", back: "/descargas/91279e3f91a9afa0/", cancel: "/plantillas/cotizador-excel/" },
    inventario: { name: "Revexup - Plantilla Control de inventario (Excel)",      amount: "15.00", currency: "USD", back: "/descargas/487b0ca5e72ab0cb/", cancel: "/plantillas/control-de-inventario-excel/" },
    dashboard:  { name: "Revexup - Plantilla Dashboard de ventas (Excel)",        amount: "19.00", currency: "USD", back: "/descargas/caf8d1f2b9b04c42/", cancel: "/plantillas/dashboard-de-ventas-excel/" },
    pack:       { name: "Revexup - Pack 3 plantillas Excel (cotizador, inventario, dashboard)", amount: "35.00", currency: "USD", back: "/descargas/4a70e36d4870b7c0/", cancel: "/plantillas/" },
    setup:      { name: "Revexup - Sistema Resenas 5 estrellas (hecho para ti)",  amount: "29.00", currency: "USD", back: "/gracias/?p=setup", cancel: "/resenas/#precios" },
    monthly:    { name: "Revexup - Reputacion en piloto (mensual)",               amount: "19.00", currency: "USD", back: "/gracias/?p=monthly", cancel: "/resenas/#precios" },
    multi:      { name: "Revexup - Pack Sucursales (3+ ubicaciones)",             amount: "149.00", currency: "USD", back: "/gracias/?p=multi", cancel: "/resenas/#precios" }
  }
};

(function () {
  var C = window.REVEXUP;
  function payUrl(key) {
    var p = C.products[key];
    var q = new URLSearchParams({
      cmd: key === "monthly" ? "_xclick-subscriptions" : "_xclick",
      business: C.paypalEmail,
      item_name: p.name,
      currency_code: p.currency,
      no_shipping: "1",
      rm: "1",
      return: C.site + p.back,
      cancel_return: C.site + p.cancel,
      charset: "utf-8"
    });
    if (key === "monthly") { q.set("a3", p.amount); q.set("p3", "1"); q.set("t3", "M"); q.set("src", "1"); }
    else { q.set("amount", p.amount); }
    return "https://www.paypal.com/cgi-bin/webscr?" + q.toString();
  }
  C.payUrl = payUrl;
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-pay]").forEach(function (a) { a.href = payUrl(a.getAttribute("data-pay")); a.rel = "nofollow"; });
    document.querySelectorAll("[data-mail]").forEach(function (a) {
      var s = a.getAttribute("data-mail") || "";
      var b = a.getAttribute("data-body") || "";
      var qs = [];
      if (s) qs.push("subject=" + encodeURIComponent(s));
      if (b) qs.push("body=" + encodeURIComponent(b.replace(/\\n/g, "\n")));
      a.href = "mailto:" + C.email + (qs.length ? "?" + qs.join("&") : "");
      if (!a.textContent.trim()) a.textContent = C.email;
    });
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      if (!C.whatsapp) { a.classList.add("hidden"); return; }
      a.href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(a.getAttribute("data-wa") || "Hola");
    });
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
  });
})();
