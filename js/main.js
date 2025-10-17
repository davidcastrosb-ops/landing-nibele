/**
 * Nibele – main.js
 * Mantengo todo seguro y no invasivo. No toco tus estilos.
 */

(function(){
  // ====== CONFIG ======
  const WHATSAPP_NUMBER = "+523337241151";
  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwb3H46ckuRjO0kXMkQq7VwdqKUEcgbrRMy-rzu2ccnNV2YrpQns-vlwmoUtm--vkKQtQ/exec";

  // Mapa (coordenadas y enlaces)
  const DESARROLLOS = [
    { nombre: "Nibele Moderna", coords: { lat: 20.6577, lng: -103.3574 }, url: "https://moderna.3dhomes.com.mx" },
    { nombre: "Nibele Libertad", coords: { lat: 20.6905, lng: -103.3630 }, url: "https://libertad.3dhomes.com.mx" },
    { nombre: "Nibele Áurea", coords: { lat: 20.7002, lng: -103.3880 }, url: "https://aurea.3dhomes.com.mx" },
    { nombre: "Nibele Americana", coords: { lat: 20.6736, lng: -103.3728 }, url: "https://americana.3dhomes.com.mx" },
    { nombre: "Nibele Centro Histórico", coords: { lat: 20.6766, lng: -103.3476 }, url: "https://centrohistorico.3dhomes.com.mx" },
  ];
  const GDL_CENTER = { lat: 20.6736, lng: -103.344 };

  // ====== UTIL ======
  function mapsKey() {
    const meta = document.querySelector("#maps-key");
    return meta?.dataset?.key || "";
  }
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.defer = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // ====== MAPA ======
  async function initMap() {
    const key = mapsKey();
    const container = document.getElementById("map");
    if (!container || !key) return;
    if (!window.google || !window.google.maps) {
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`);
    }
    const map = new google.maps.Map(container, {
      center: GDL_CENTER, zoom: 12, mapTypeControl: false, streetViewControl: false
    });
    const bounds = new google.maps.LatLngBounds();
    DESARROLLOS.forEach(d => {
      const marker = new google.maps.Marker({ map, position: d.coords, title: d.nombre });
      const info = new google.maps.InfoWindow({
        content: `<div style="min-width:180px"><strong>${d.nombre}</strong><br/><a href="${d.url}" target="_blank" rel="noreferrer">Abrir sitio</a></div>`
      });
      marker.addListener("click", () => info.open({ map, anchor: marker }));
      bounds.extend(d.coords);
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds);
  }

  // ====== FORM + WHATSAPP ======
  function buildWaText(data){
    return `Hola, me interesa Nibele Residencial.
Nombre: ${data.nombre}
Teléfono: ${data.telefono}
Email: ${data.email || ""}
Zona: ${data.zona || ""}
Presupuesto: ${data.presupuesto || ""}
Crédito: ${data.credito || ""}

${data.mensaje || ""}`;
  }
  function waLink(txt){
    return `https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g,"")}?text=${encodeURIComponent(txt)}`;
  }
  function handleForm(){
    const f = document.getElementById("lead-form");
    const soloWA = document.getElementById("solo-wa");
    if (!f) return;

    function getData(){
      const fd = new FormData(f);
      return Object.fromEntries(fd.entries());
    }

    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = getData();
      const payload = {
        timestamp: new Date().toISOString(),
        proyecto: "Nibele Residencial",
        ...data,
        source: location.href
      };
      // Enviar a Google Sheet (no-cors)
      try {
        if (GAS_WEB_APP_URL) {
          await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            mode: "no-cors"
          });
        }
      } catch {}
      // Abrir WhatsApp
      window.open(waLink(buildWaText(data)), "_blank");
      f.reset();
    });

    if (soloWA) {
      soloWA.addEventListener("click", (e) => {
        e.preventDefault();
        const data = getData();
        window.open(waLink(buildWaText(data)), "_blank");
      });
    }
  }

  // ====== MODAL DESCARGA ======
  function modalDescarga(){
    const modal = document.getElementById("dl-modal");
    const goForm = document.getElementById("go-form");
    const closeBtn = document.getElementById("close-modal");
    const triggers = document.querySelectorAll(".btn-descargar");

    if (!modal || !goForm || !closeBtn || !triggers.length) return;
    const open = () => { modal.hidden = false; document.body.style.overflow = "hidden"; };
    const close = () => { modal.hidden = true; document.body.style.overflow = ""; };

    triggers.forEach(btn => btn.addEventListener("click", (e)=>{
      e.preventDefault();
      open();
    }));
    closeBtn.addEventListener("click", close);
    goForm.addEventListener("click", () => {
      close();
      document.querySelector('#contacto')?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ====== MISC ======
  function setYear(){
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  // ====== BOOT ======
  function boot(){
    setYear();
    handleForm();
    modalDescarga();
    initMap();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();