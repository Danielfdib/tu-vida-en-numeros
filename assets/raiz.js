// ============================================================
//  Estudio Raíz — componentes compartidos
//  Cada página solo pone estos "huecos" y este script los rellena:
//    <div id="raiz-follow"></div>   → bloque "síguenos en redes"
//    <div id="raiz-sell"></div>     → bloque "¿tienes un negocio?"
//    <div class="share" data-share></div> → botones de compartir
//    <div class="ad-slot"></div>    → anuncio (solo si hay AdSense)
//    <footer id="raiz-footer"></footer>
// ============================================================
(function () {
  const C = window.RAIZ_CONFIG || {};
  const R = C.redes || {};
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const configured = (url) => url && !/TU_(USUARIO|PAGINA|CANAL)/.test(url);

  const REDES = [
    ["instagram", "Instagram"],
    ["tiktok", "TikTok"],
    ["facebook", "Facebook"],
    ["youtube", "YouTube"],
  ];

  // ---------- Aviso flotante ----------
  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  // ---------- Compartir ----------
  function pageUrl() {
    return location.origin + location.pathname;
  }

  async function shareNative(text, url) {
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); return true; }
      catch (e) { return e && e.name === "AbortError"; }
    }
    return false;
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("¡Enlace copiado!"); }
    catch { prompt("Copia este enlace:", text); }
  }

  // Comparte un archivo (por ejemplo la imagen para historias). Si el navegador
  // no puede compartir archivos, la descarga.
  async function shareFile(blob, filename, text) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Imagen descargada: súbela a tus historias");
  }

  // Dibuja los botones de compartir dentro de un contenedor.
  // getText: función que devuelve el texto a compartir (puede depender del resultado).
  function renderShare(el, getText) {
    const text = () => (getText ? getText() : el.dataset.text || document.title);
    el.innerHTML = `
      <button type="button" class="btn" data-a="native">Compartir</button>
      <a class="btn ghost" data-a="wa" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn ghost" data-a="fb" target="_blank" rel="noopener">Facebook</a>
      <button type="button" class="btn ghost" data-a="copy">Copiar enlace</button>`;
    const url = pageUrl();
    const wa = el.querySelector('[data-a="wa"]');
    const fb = el.querySelector('[data-a="fb"]');
    const refresh = () => {
      wa.href = "https://wa.me/?text=" + encodeURIComponent(text() + " " + url);
      fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    };
    refresh();
    wa.addEventListener("pointerdown", refresh);
    wa.addEventListener("focus", refresh);
    el.querySelector('[data-a="native"]').addEventListener("click", async () => {
      if (!(await shareNative(text(), url))) copy(text() + " " + url);
    });
    el.querySelector('[data-a="copy"]').addEventListener("click", () => copy(url));
    if (!navigator.share) el.querySelector('[data-a="native"]').classList.add("hidden");
  }

  // ---------- Bloques de marca ----------
  function socialLinks() {
    return REDES.filter(([k]) => configured(R[k]))
      .map(([k, name]) => `<a href="${esc(R[k])}" target="_blank" rel="noopener" data-red="${k}">${name}</a>`)
      .join("");
  }

  function renderFollow(el) {
    const links = socialLinks();
    if (!links) { el.classList.add("hidden"); return; }
    el.classList.add("card", "follow");
    el.innerHTML = `
      <h2>¿Te sirvió? Síguenos ${esc(C.usuario || "")}</h2>
      <p>Subimos una herramienta gratis nueva cada semana.</p>
      <div class="social">${links}</div>`;
  }

  function renderSell(el) {
    if (!C.whatsappVentas) { el.classList.add("hidden"); return; }
    const msg = encodeURIComponent(`Hola ${C.marca}, vi "${document.title}" y quiero una página para mi negocio.`);
    el.classList.add("card", "sell");
    el.innerHTML = `
      <h2>¿Tienes un negocio o emprendimiento?</h2>
      <p>Hacemos páginas simples como esta para tu negocio: menú, catálogo, link en bio o tarjeta digital. Rápidas, lindas y a buen precio.</p>
      <a class="btn alt" href="https://wa.me/${esc(C.whatsappVentas)}?text=${msg}" target="_blank" rel="noopener">Pedir mi página por WhatsApp</a>`;
  }

  function renderFooter(el) {
    const year = new Date().getFullYear();
    const donar = C.donaciones ? ` · <a href="${esc(C.donaciones)}" target="_blank" rel="noopener">Invítanos un café</a>` : "";
    el.classList.add("raiz-footer");
    el.innerHTML = `
      <div class="wrap">
        <div class="social" style="margin-bottom:12px">${socialLinks()}</div>
        <div>© ${year} ${esc(C.marca || "")} · Herramientas simples y gratis
          · <a href="https://estudio-raiz.vercel.app/privacidad" target="_blank" rel="noopener">Privacidad</a>
          · <a href="https://estudio-raiz.vercel.app/terminos" target="_blank" rel="noopener">Términos</a>${donar}</div>
      </div>`;
  }

  // ---------- Anuncios (AdSense) ----------
  function loadAds() {
    if (!C.adsenseClient) return;
    const slots = document.querySelectorAll(".ad-slot");
    if (!slots.length) return;
    document.documentElement.classList.add("ads-on");
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(C.adsenseClient);
    document.head.appendChild(s);
    slots.forEach((slot) => {
      slot.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(C.adsenseClient)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  function init() {
    const f = document.getElementById("raiz-follow"); if (f) renderFollow(f);
    const s = document.getElementById("raiz-sell"); if (s) renderSell(s);
    const ft = document.getElementById("raiz-footer"); if (ft) renderFooter(ft);
    document.querySelectorAll("[data-share]").forEach((el) => { if (!el.dataset.manual) renderShare(el); });
    loadAds();
  }

  window.Raiz = { toast, renderShare, shareFile, copy, config: C };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
