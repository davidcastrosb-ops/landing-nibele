
(function(){
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Modal descarga
  const modal = document.getElementById('dl-modal');
  const closeBtn = document.getElementById('close-modal');
  const goForm = document.getElementById('go-form');
  document.querySelectorAll('.btn-descargar').forEach(b => {
    b.addEventListener('click', () => modal.hidden = false);
  });
  if (closeBtn) closeBtn.onclick = () => modal.hidden = true;
  if (goForm) goForm.onclick = () => { modal.hidden = true; };

  // Form + WhatsApp + Google Sheet
  const WHATSAPP_NUMBER = "+523337241151";
  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwb3H46ckuRjO0kXMkQq7VwdqKUEcgbrRMy-rzu2ccnNV2YrpQns-vlwmoUtm--vkKQtQ/exec";
  const form = document.getElementById('lead-form');
  const soloWa = document.getElementById('solo-wa');

  function buildWaText(data){
    return `Hola, me interesa Nibele Residencial.
Nombre: ${data.nombre}
Email: ${data.email||''}
Teléfono: ${data.telefono}
Zona: ${data.zona||''}
Presupuesto: ${data.presupuesto||''}
Crédito: ${data.credito||''}

${data.mensaje||''}`;
  }
  function waLink(text){
    return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\\d]/g,'')}?text=${encodeURIComponent(text)}`;
  }

  if (form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      const text = buildWaText(data);

      // fire and forget to Sheet
      if (GAS_WEB_APP_URL && GAS_WEB_APP_URL.startsWith('https://')){
        try {
          fetch(GAS_WEB_APP_URL, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              proyecto: 'Nibele Residencial',
              desarrollo: 'Landing general',
              ...data,
              source: location.href
            }),
            mode: 'no-cors'
          });
        } catch(_) {}
      }
      window.open(waLink(text), '_blank');
    });
    // Solo WhatsApp quick
    if (soloWa){
      soloWa.addEventListener('click', (e)=>{
        const fd = new FormData(form);
        const data = Object.fromEntries(fd.entries());
        const text = buildWaText(data);
        soloWa.href = waLink(text);
      });
    }
  }

  // Maps
  const MAPS_KEY = (document.getElementById('maps-key')||{}).dataset.key;
  if (MAPS_KEY){
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    s.async = true; s.defer = true;
    s.onload = initMap;
    document.body.appendChild(s);
  }
  function initMap(){
    const el = document.getElementById('map');
    if (!el || !window.google) return;
    const center = {lat:20.6736, lng:-103.344};
    const map = new google.maps.Map(el, {center, zoom:12, mapTypeControl:false, streetViewControl:false});
    const places = [
      {n:'Nibele Moderna', pos:{lat:20.6577, lng:-103.3574}, url:'https://moderna.3dhomes.com.mx'},
      {n:'Nibele Libertad', pos:{lat:20.6905, lng:-103.3630}, url:'https://libertad.3dhomes.com.mx'},
      {n:'Nibele Áurea', pos:{lat:20.7002, lng:-103.3880}, url:'https://aurea.3dhomes.com.mx'},
      {n:'Nibele Americana', pos:{lat:20.6736, lng:-103.3728}, url:'https://americana.3dhomes.com.mx'},
      {n:'Nibele Centro Histórico', pos:{lat:20.6766, lng:-103.3476}, url:'https://centrohistorico.3dhomes.com.mx'},
    ];
    const bounds = new google.maps.LatLngBounds();
    places.forEach(p=>{
      const m = new google.maps.Marker({map, position:p.pos, title:p.n});
      const info = new google.maps.InfoWindow({content:`<div style="min-width:180px"><strong>${p.n}</strong><br/><a href="${p.url}" target="_blank" rel="noreferrer">Abrir sitio</a></div>`});
      m.addListener('click', ()=> info.open({map, anchor:m}));
      bounds.extend(p.pos);
    });
    map.fitBounds(bounds);
  }
})();
