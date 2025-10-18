
// ====== CONFIG ======
const WHATSAPP_NUMBER = "+523337241151";
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwb3H46ckuRjO0kXMkQq7VwdqKUEcgbrRMy-rzu2ccnNV2YrpQns-vlwmoUtm--vkKQtQ/exec";
const MAPS_API_KEY = "AIzaSyAPw7aLsosS1uKO2mXxjpSO2jpsIyCA9gc"; // key integrada

// ====== Datos de desarrollos ======
const DESARROLLOS = [
  {
    key: "moderna", nombre: "Nibele Moderna", url: "https://moderna.3dhomes.com.mx",
    coords: { lat: 20.6577, lng: -103.3574 },
    img: "./assets/desarrollos/moderna.jpg",
    imgs: ["./assets/desarrollos/moderna-1.jpg","./assets/desarrollos/moderna-2.jpg","./assets/desarrollos/moderna-3.jpg"],
    features: ["Ubicación céntrica","Plusvalía","Familias"]
  },
  {
    key: "libertad", nombre: "Nibele Libertad", url: "https://libertad.3dhomes.com.mx",
    coords: { lat: 20.6905, lng: -103.3630 },
    img: "./assets/desarrollos/libertad.jpg",
    imgs: ["./assets/desarrollos/libertad-1.jpg","./assets/desarrollos/libertad-2.jpg","./assets/desarrollos/libertad-3.jpg"],
    features: ["Conectividad","Servicios","Diseño"]
  },
  {
    key: "aurea", nombre: "Nibele Áurea", url: "https://aurea.3dhomes.com.mx",
    coords: { lat: 20.7002, lng: -103.3880 },
    img: "./assets/desarrollos/aurea.jpg",
    imgs: ["./assets/desarrollos/aurea-1.jpg","./assets/desarrollos/aurea-2.jpg","./assets/desarrollos/aurea-3.jpg"],
    features: ["Boutique","Tranquilo","Calidad"]
  },
  {
    key: "americana", nombre: "Nibele Americana", url: "https://americana.3dhomes.com.mx",
    coords: { lat: 20.6736, lng: -103.3728 },
    img: "./assets/desarrollos/americana.jpg",
    imgs: ["./assets/desarrollos/americana-1.jpg","./assets/desarrollos/americana-2.jpg","./assets/desarrollos/americana-3.jpg"],
    features: ["Vida urbana","Cafés","A pie"]
  },
  {
    key: "centro", nombre: "Nibele Centro Histórico", url: "https://centrohistorico.3dhomes.com.mx",
    coords: { lat: 20.6766, lng: -103.3476 },
    img: "./assets/desarrollos/centrohistorico.jpg",
    imgs: ["./assets/desarrollos/centrohistorico-1.jpg","./assets/desarrollos/centrohistorico-2.jpg","./assets/desarrollos/centrohistorico-3.jpg"],
    features: ["Patrimonio","Comercio","Renta"]
  }
];

let activeKey = "moderna";
function $(sel){ return document.querySelector(sel); }

// ====== Autofill helpers ======
function getParams(){ const u = new URL(window.location.href); return Object.fromEntries(u.searchParams.entries()); }
const STORAGE_KEY = "nibele_form_autofill_v1";
function saveFormSnapshot(){
  const form = document.getElementById("contact-form");
  if (!form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function loadFormSnapshot(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const form = document.getElementById("contact-form");
    if (!form) return;
    Object.keys(data).forEach(k => {
      const el = form.elements.namedItem(k);
      if (el && typeof el.value !== "undefined" && data[k]) el.value = data[k];
    });
  } catch {}
}
function prefillFromParams(){
  const p = getParams();
  const form = document.getElementById("contact-form");
  if (!form) return;
  ["nombre","email","telefono","zona","presupuesto","credito","mensaje"].forEach(k => {
    if (p[k]) { const el = form.elements.namedItem(k); if (el) el.value = p[k]; }
  });
}

// ====== HERO & tarjetas ======
function renderHero() {
  const dev = DESARROLLOS.find(d => d.key === activeKey) || DESARROLLOS[0];
  $("#hero-img").src = dev.img;
  $("#hero-current").textContent = dev.nombre;
}
function renderTabs() {
  const tabs = $("#tabs");
  tabs.innerHTML = "";
  DESARROLLOS.forEach(d => {
    const btn = document.createElement("button");
    btn.className = "tab" + (d.key === activeKey ? " active" : "");
    btn.textContent = d.nombre.split(" ")[1];
    btn.onclick = () => { activeKey = d.key; renderHero(); renderGrid(); };
    tabs.appendChild(btn);
  });
}
function renderGrid() {
  const grid = $("#grid");
  grid.innerHTML = "";
  DESARROLLOS.forEach(d => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="img-wrap">
        <img src="${d.img}" alt="${d.nombre}" class="card-cover" data-gallery="${d.key}"/>
      </div>
      <div class="body">
        <div style="font-weight:600">${d.nombre}</div>
        <div class="pills">
          ${d.features.map(f => `<span class="pill">${f}</span>`).join("")}
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <a class="btn" href="${d.url}" target="_blank" rel="noreferrer">Ir al sitio</a>
          <button class="btn secondary" data-key="${d.key}">Ver en héroe</button>
          <button class="btn primary" data-download="${d.key}">Descargar</button>
        </div>
      </div>
    `;
    card.querySelector("button[data-key]").onclick = () => { activeKey = d.key; renderHero(); window.scrollTo({top:0,behavior:"smooth"}); };
    card.querySelector("button[data-download]").onclick = () => openDownloadPrompt(d);
    card.querySelector('img[data-gallery]').onclick = () => openGallery(d);
    grid.appendChild(card);
  });
}

// ====== Marker label icon (SVG) ======
function makeNameIcon(text){
  const t = (text || "").trim();
  const short = t.length > 18 ? t.slice(0,16) + "…" : t;
  const padX = 14, fontSize = 12;
  const width = Math.max(36, short.length * 7 + padX * 2);
  const height = 28;
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height+10}'>
    <defs>
      <filter id='shadow' x='-10%' y='-10%' width='120%' height='120%'>
        <feDropShadow dx='0' dy='1' stdDeviation='1.2' flood-color='rgba(0,0,0,0.35)'/>
      </filter>
    </defs>
    <g filter='url(#shadow)'>
      <rect x='0' y='0' rx='14' ry='14' width='${width}' height='${height}' fill='#ffffff' stroke='rgba(17,24,39,.15)'/>
      <text x='${width/2}' y='${height/2 + 4}' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='${fontSize}' fill='#111827'>${short}</text>
      <path d='M ${width/2} ${height} l 0 6' stroke='#111827' stroke-width='1.4' />
    </g>
  </svg>`;
  return { url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg), size: new google.maps.Size(width, height+10), anchor: new google.maps.Point(width/2, height+10) };
}

// ====== Google Maps ======
function loadGoogleMaps(cb){
  if (!MAPS_API_KEY) {
    const img = document.createElement("img");
    img.src = "./assets/mapa.jpg"; img.alt = "Mapa";
    img.style.display = "block"; img.style.width = "100%"; img.style.height = "auto";
    const mapEl = document.getElementById("map"); mapEl.parentNode.replaceChild(img, mapEl); return;
  }
  if (window.google && window.google.maps) return cb();
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}`; s.async = true; s.defer = true; s.onload = cb;
  document.body.appendChild(s);
}
function initMap(){
  const mapEl = document.getElementById("map");
  const map = new google.maps.Map(mapEl, { center: { lat: 20.6736, lng: -103.344 }, zoom: 12, mapTypeControl: false, streetViewControl: false });
  const bounds = new google.maps.LatLngBounds();
  DESARROLLOS.forEach(d => {
    const marker = new google.maps.Marker({ position: d.coords, map, title: d.nombre, icon: makeNameIcon(d.nombre) });
    const info = new google.maps.InfoWindow({ content: `<div style="min-width:180px"><strong>${d.nombre}</strong><br/><a href='${d.url}' target='_blank' rel='noreferrer'>Abrir sitio</a></div>` });
    marker.addListener("click", () => info.open({ map, anchor: marker }));
    bounds.extend(d.coords);
  });
  map.fitBounds(bounds);
}

// ====== Descargar: modal y redirección ======
let pendingDev = null;
function openDownloadPrompt(dev){ pendingDev = dev; document.getElementById("download-modal").classList.remove("hidden"); }
function closeDownloadPrompt(){ document.getElementById("download-modal").classList.add("hidden"); }
function goToFormForDownload(){
  if (pendingDev){
    activeKey = pendingDev.key; renderHero();
    const form = document.getElementById("contact-form");
    const msg = form.elements.namedItem("mensaje");
    if (msg){ msg.value = `Quiero la ficha completa / brochure de ${pendingDev.nombre}. También deseo precios, tipologías y disponibilidad.`; }
  }
  closeDownloadPrompt();
  document.getElementById("contacto").scrollIntoView({ behavior:"smooth", block:"start" });
  const nameInput = document.querySelector('#contact-form input[name="nombre"]'); if (nameInput) nameInput.focus();
}

// ====== Galería ======
function openGallery(dev){
  const modal = document.getElementById('gallery-modal');
  const main = document.getElementById('gallery-main');
  const thumbs = document.getElementById('gallery-thumbs');
  const imgs = Array.isArray(dev.imgs) && dev.imgs.length ? dev.imgs : [dev.img];
  main.src = imgs[0];
  thumbs.innerHTML = "";
  imgs.forEach((src, i) => {
    const t = document.createElement('img'); t.src = src;
    if (i === 0) t.classList.add('active');
    t.onclick = () => { main.src = src; Array.from(thumbs.querySelectorAll('img')).forEach(x => x.classList.remove('active')); t.classList.add('active'); };
    thumbs.appendChild(t);
  });
  modal.classList.remove('hidden');
}
function closeGallery(){ document.getElementById('gallery-modal').classList.add('hidden'); }

// ====== Formulario ======
function buildWhatsAppText(dev, data){
  return `Hola, me interesa ${dev.nombre}.%0A%0A` +
         `Nombre: ${encodeURIComponent(data.nombre||"")}%0A` +
         `Email: ${encodeURIComponent(data.email||"")}%0A` +
         `Teléfono: ${encodeURIComponent(data.telefono||"")}%0A` +
         `Zona: ${encodeURIComponent(data.zona||"")}%0A` +
         `Presupuesto: ${encodeURIComponent(data.presupuesto||"")}%0A` +
         `Crédito: ${encodeURIComponent(data.credito||"Infonavit")}%0A%0A` +
         `${encodeURIComponent(data.mensaje||"Quiero información, agendar visita y recibir opciones disponibles.")}`;
}
function onSubmit(e){
  e.preventDefault();
  const form = document.getElementById('contact-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = Object.fromEntries(new FormData(e.target).entries());
  const dev = DESARROLLOS.find(d => d.key === activeKey) || DESARROLLOS[0];
  fetch(GAS_WEB_APP_URL, { method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ timestamp: new Date().toISOString(), proyecto:"Nibele Residencial", desarrollo: dev.nombre, ...data, source:"nibele.3dhomes.com.mx" }),
    mode:"no-cors" }).catch(console.warn);
  const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g,"")}?text=${buildWhatsAppText(dev, data)}`;
  window.open(url, "_blank"); alert("¡Gracias! Enseguida te contactamos por WhatsApp."); e.target.reset();
}

// ====== Init ======
window.addEventListener("DOMContentLoaded", () => {
  // Render UI
  const html = `
    <header>
      <div class="container nav">
        <div class="logo">
          <img src="./assets/logo-trhoncal-homes.png" alt="Trhoncal Homes"/>
          <div><div class="note">Comercializa</div><div style="font-weight:700">Trhoncal Homes · Nibele Residencial</div></div>
        </div>
        <nav style="display:flex;gap:8px">
          <a class="btn secondary" href="#desarrollos">Desarrollos</a>
          <a class="btn secondary" href="#amenidades">Amenidades</a>
          <a class="btn secondary" href="#mapa">Mapa</a>
          <a class="btn primary" href="#contacto">Quiero información</a>
        </nav>
      </div>
    </header>
    <main>
      <section class="container hero">
        <div>
          <span class="badge">nibele.3dhomes.com.mx</span>
          <h1 id="hero-title">Estrena hogar en ubicaciones clave de Guadalajara</h1>
          <p id="hero-note">Nibele Residencial llega a Guadalajara con proyectos modernos, eficientes y llenos de vida.</p>
          <div class="tabs" id="tabs"></div>
          <div style="margin-top:12px; color:var(--muted); font-size:14px">Viendo: <strong id="hero-current">-</strong></div>
          <div style="margin-top:14px;display:flex;gap:10px">
            <a class="btn primary" href="#contacto">Asesor por WhatsApp</a>
            <a class="btn" href="#desarrollos">Ver desarrollos</a>
          </div>
        </div>
        <div class="preview">
          <img id="hero-img" src="./assets/bg-hero.jpg" alt="Vista desarrollo" style="width:100%;height:auto;display:block"/>
        </div>
      </section>
      <section id="desarrollos" class="container section"><div class="grid" id="grid"></div></section>
      <section id="amenidades" class="container section">
        <h2 style="font-size:28px;margin:0 0 12px">Amenidades y estilo de vida</h2>
        <p class="small" style="margin-bottom:14px">Acceso controlado, áreas verdes, modelos eficientes y ubicaciones con servicios y movilidad.</p>
        <div class="amenities">
          <div class="amen"><span>🔒</span><div>Acceso controlado</div></div>
          <div class="amen"><span>🌳</span><div>Parques y áreas verdes</div></div>
          <div class="amen"><span>🏦</span><div>Crédito Infonavit y bancos</div></div>
          <div class="amen"><span>⭐</span><div>Plusvalía y rentabilidad</div></div>
          <div class="amen"><span>📍</span><div>Ubicaciones estratégicas</div></div>
          <div class="amen"><span>🏠</span><div>Modelos eficientes</div></div>
        </div>
      </section>
      <section id="mapa" class="map-wrap section">
        <div class="container map-inner">
          <div>
            <span class="badge badge-gold">Mapa interactivo</span>
            <h2 style="font-size:28px;margin:10px 0 8px;color:#fff">Conecta con tu zona ideal</h2>
            <p class="small" style="color:#cbd5e1">Clic en los marcadores para abrir el sitio de cada desarrollo.</p>
            <div style="margin-top:14px;display:flex;gap:10px">
              <a class="btn primary" href="#contacto">Pedir rutas</a>
              <a class="btn" href="https://nibele.3dhomes.com.mx">Explorar subdominio</a>
            </div>
          </div>
          <div class="map-box"><div id="map"></div></div>
        </div>
      </section>
      <section id="contacto" class="container section">
        <h2 style="font-size:28px;margin:0 0 12px">Agenda tu visita o recibe opciones por WhatsApp</h2>
        <form id="contact-form" autocomplete="on">
          <label for="nombre" class="small">Nombre completo</label>
          <input id="nombre" type="text" name="nombre" placeholder="Nombre completo" autocomplete="name" required />
          <div class="row">
            <div style="width:100%"><label for="email" class="small">Correo</label>
              <input id="email" type="email" name="email" placeholder="Correo" autocomplete="email" required/></div>
            <div style="width:100%"><label for="telefono" class="small">Teléfono (WhatsApp)</label>
              <input id="telefono" type="tel" name="telefono" placeholder="Teléfono (WhatsApp)" autocomplete="tel" pattern="[0-9\\s+()-]{8,}" required/></div>
          </div>
          <label for="zona" class="small">Zona o colonia</label>
          <input id="zona" type="text" name="zona" placeholder="Zona o colonia" autocomplete="street-address"/>
          <div class="row">
            <div style="width:100%"><label for="presupuesto" class="small">Presupuesto aprox. (MXN)</label>
              <input id="presupuesto" type="text" name="presupuesto" placeholder="Presupuesto aprox. (MXN)" inputmode="numeric" autocomplete="off"/></div>
            <div style="width:100%"><label for="credito" class="small">Crédito</label>
              <select id="credito" name="credito"><option>Infonavit</option><option>Bancario</option><option>Fovissste</option><option>Recurso propio</option></select></div>
          </div>
          <textarea name="mensaje" rows="3" placeholder="Mensaje">Quiero información, agendar visita y recibir opciones disponibles.</textarea>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button class="btn primary" type="submit">Enviar y abrir WhatsApp</button>
            <a class="btn" href="#desarrollos">Ver más desarrollos</a>
          </div>
          <p class="small">Al enviar aceptas ser contactado para brindarte información de Nibele Residencial.</p>
        </form>
      </section>
    </main>
    <footer><div class="container" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <div class="small">© <span id="year"></span> Trhoncal Homes · Nibele Residencial</div>
      <div class="small">nibele.3dhomes.com.mx · Guadalajara, Jal.</div>
    </div></footer>
    <div id="download-modal" class="modal hidden"><div class="modal__backdrop"></div><div class="modal__panel">
      <h3 style="margin:0 0 8px;font-size:20px">Llena tus datos para descargar</h3><p class="small" style="margin:0 0 14px">Compártenos tu nombre, correo y WhatsApp para enviarte la ficha completa / brochure del desarrollo seleccionado.</p>
      <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn secondary" id="download-cancel">Cancelar</button><button class="btn primary" id="download-go">Ir al formulario</button></div>
    </div></div>
    <div id="gallery-modal" class="modal hidden"><div class="modal__backdrop"></div><div class="modal__panel gallery">
      <button id="gallery-close" class="btn secondary" style="position:absolute;right:12px;top:12px">Cerrar</button>
      <img id="gallery-main" src="" alt="Foto desarrollo" class="gallery-main"/><div id="gallery-thumbs" class="gallery-thumbs"></div>
    </div></div>
  `;
  document.body.innerHTML = html;
  document.getElementById('year').textContent = new Date().getFullYear();

  renderHero(); renderTabs(); renderGrid();
  loadFormSnapshot(); prefillFromParams();
  document.getElementById("contact-form").addEventListener("change", saveFormSnapshot);
  document.getElementById("contact-form").addEventListener("submit", onSubmit);
  document.getElementById("download-cancel").addEventListener("click", closeDownloadPrompt);
  document.getElementById("download-go").addEventListener("click", goToFormForDownload);
  document.getElementById('gallery-close').addEventListener('click', closeGallery);
  document.querySelector('#gallery-modal .modal__backdrop').addEventListener('click', closeGallery);
  loadGoogleMaps(initMap);
  window.scrollTo(0,0);
});
