/* script.js - hero scroll + modal + optional Google Apps Script endpoint
   Keep GAS_ENDPOINT empty or set to your Apps Script Web App to store emails in Google Sheets.
*/

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzP7JaFNr8NwlJqtiSknMIES7gKOtlW_QRbPveSEcyePdwhE8Cb6sJ_uB2YYvbGPqTr/exec';

document.addEventListener('DOMContentLoaded', () => {
  // HERO: add/remove .scrolled on small scroll
  const hero = document.getElementById('hero');
  const THRESHOLD = 6;
  function handleHeroScroll(){
    const y = window.scrollY || window.pageYOffset;
    if (!hero) return;
    if (y > THRESHOLD) hero.classList.add('scrolled');
    else hero.classList.remove('scrolled');
  }
  window.addEventListener('scroll', handleHeroScroll, { passive: true });
  handleHeroScroll();

  // Video: play/pause on small screens to save data
  const experSection = document.querySelector('.section-experiencias');
  if (experSection){
    const vid = experSection.querySelector('.bg-video');
    if (vid){
      const mql = window.matchMedia('(max-width: 700px)');
      if (mql.matches) vid.pause();
      mql.addEventListener('change', (ev) => {
        if (ev.matches) vid.pause();
        else vid.play().catch(()=>{});
      });
    }
  }

  // Buy modal logic (unchanged)
  const buyButtons = document.querySelectorAll('.btn-buy');
  const buyModal = document.getElementById('buyModal');
  const modalClose = document.getElementById('modalClose');
  const buyForm = document.getElementById('buyForm');
  const buyEmail = document.getElementById('buyEmail');
  const buyMsg = document.getElementById('buyMsg');
  const modalProductTitle = document.getElementById('modalProductTitle');
  const buyProductInput = document.getElementById('buyProductInput');

  function openBuyModal(productName){
    if (!buyModal) return;
    if (modalProductTitle) modalProductTitle.textContent = `Avisame cuando "${productName}" esté disponible`;
    if (buyProductInput) buyProductInput.value = productName;
    if (buyEmail) buyEmail.value = '';
    if (buyMsg) buyMsg.textContent = '';
    buyModal.classList.add('open');
    buyModal.setAttribute('aria-hidden','false');
    if (buyEmail) buyEmail.focus();
  }
  function closeBuyModal(){
    if (!buyModal) return;
    buyModal.classList.remove('open');
    buyModal.setAttribute('aria-hidden','true');
  }

  buyButtons.forEach(btn=>{
    btn.addEventListener('click', () => {
      const product = btn.dataset.product || 'Producto';
      openBuyModal(product);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeBuyModal);
  if (buyModal) buyModal.addEventListener('click', (e) => { if (e.target === buyModal) closeBuyModal(); });

  if (buyForm){
    buyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = buyEmail.value.trim();
      const product = buyProductInput.value || 'Producto';
      if (!validateEmail(email)){
        buyMsg.textContent = 'Por favor ingresa un email válido.';
        buyMsg.style.color = '#ffb0b0';
        return;
      }
      buyMsg.textContent = 'Enviando...';
      if (GAS_ENDPOINT){
        try{
          console.log('[form] Enviando a GAS_ENDPOINT:', GAS_ENDPOINT);
          const payload = { email, product, ts: new Date().toISOString() };
          console.log('[form] Payload:', payload);
          // Try POST first; if it fails (CORS/network), fallback to JSONP GET
          const ok = await sendToEndpoint(GAS_ENDPOINT, payload);
          console.log('[form] Resultado envío:', ok);
          if (ok){
            buyMsg.textContent = '¡Listo! Te avisaremos cuando esté disponible.';
            buyMsg.style.color = '#b8ffd6';
            buyForm.reset();
          } else {
            buyMsg.textContent = 'Error al enviar. Guardado localmente.';
            buyMsg.style.color = '#ffb0b0';
            saveLocal(email, product);
          }
        }catch(err){
          console.error('[form] Error:', err);
          buyMsg.textContent = 'Error de conexión. Guardado localmente.';
          buyMsg.style.color = '#ffb0b0';
          saveLocal(email, product);
        }
      } else {
        saveLocal(email, product);
        buyMsg.textContent = 'Guardado localmente. Cuando configures GAS_ENDPOINT se enviará.';
        buyMsg.style.color = '#b8ffd6';
        buyForm.reset();
      }
    });
  }

  function saveLocal(email, product){
    try {
      const key = 'pg_waitlist';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push({ email, product, ts: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { console.error(e); }
  }

  function validateEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (ev)=>{
      const href = a.getAttribute('href');
      if (href.length > 1){
        ev.preventDefault();
        const t = document.querySelector(href);
        if (t) t.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // HAMBURGER / mobile menu toggle
  const hamburger = document.getElementById('hamburgerBtn');
  const body = document.body;
  const headerInner = document.querySelector('.header-inner');
  // create a menu-panel wrapper around the existing nav for mobile positioning (CSS uses .menu-panel)
  const mainNav = document.querySelector('.main-nav');
  if (mainNav){
    const menuPanel = document.createElement('div');
    menuPanel.className = 'menu-panel';
    // move mainNav into menuPanel for mobile display
    mainNav.parentNode.insertBefore(menuPanel, mainNav.nextSibling);
    menuPanel.appendChild(mainNav);
  }

  function closeMenu(){
    body.classList.remove('menu-open');
    if (hamburger) hamburger.setAttribute('aria-expanded','false');
  }
  function openMenu(){
    body.classList.add('menu-open');
    if (hamburger) hamburger.setAttribute('aria-expanded','true');
  }

  if (hamburger){
    hamburger.addEventListener('click', (e)=>{
      const isOpen = body.classList.contains('menu-open');
      if (isOpen) closeMenu(); else openMenu();
    });
  }

  // Close menu when clicking a link inside nav (useful on mobile)
  document.addEventListener('click', (e)=>{
    if (!body.classList.contains('menu-open')) return;
    const target = e.target;
    // if click is inside the menu-panel or hamburger, keep it open
    if (target.closest && (target.closest('.menu-panel') || target.closest('.hamburger'))) return;
    closeMenu();
  });

  // close on ESC
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });

  // --- Helper: resilient send with POST then JSONP fallback ---
  function jsonpRequest(url, params = {}, timeout = 8000){
    return new Promise((resolve) => {
      const callbackName = 'pg_jsonp_cb_' + Math.random().toString(36).substr(2,9);
      params.callback = callbackName;
      const query = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
      const src = url + (url.indexOf('?') === -1 ? '?' : '&') + query;

      console.log('[jsonpRequest] Creando script con src:', src);

      let timer = setTimeout(()=>{
        console.warn('[jsonpRequest] Timeout después de', timeout, 'ms');
        cleanup();
        resolve(false);
      }, timeout);

      function cleanup(){
        clearTimeout(timer);
        try{ window[callbackName] = undefined; delete window[callbackName]; }catch(e){}
        const el = document.getElementById(callbackName);
        if (el) el.parentNode.removeChild(el);
      }

      window[callbackName] = function(resp){
        console.log('[jsonpRequest] Callback invocado con respuesta:', resp);
        cleanup();
        if (resp && resp.status === 'ok') resolve(true);
        else resolve(false);
      };

      const s = document.createElement('script');
      s.src = src;
      s.id = callbackName;
      s.onerror = function(){ 
        console.error('[jsonpRequest] Script load error');
        cleanup(); 
        resolve(false); 
      };
      document.head.appendChild(s);
    });
  }

  async function sendToEndpoint(url, payload){
    // try POST first
    try{
      console.log('[sendToEndpoint] Intentando POST a:', url);
      const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      console.log('[sendToEndpoint] Respuesta POST:', res.status, res.ok);
      if (res && res.ok) {
        const respText = await res.text();
        console.log('[sendToEndpoint] Cuerpo respuesta:', respText);
        return true;
      }
      // server returned non-OK; still try fallback
      const text = await res.text();
      console.warn('[sendToEndpoint] POST no-OK. Status:', res.status, 'Body:', text);
    }catch(err){
      // likely CORS or network error
      console.warn('[sendToEndpoint] POST falló (CORS/red):', err.message);
    }

    // JSONP fallback: send as GET with callback
    try{
      console.log('[sendToEndpoint] Intentando fallback JSONP...');
      const params = { email: payload.email, product: payload.product, ts: payload.ts };
      const ok = await jsonpRequest(url, params, 9000);
      console.log('[sendToEndpoint] JSONP resultado:', ok);
      return ok;
    }catch(e){
      console.error('[sendToEndpoint] JSONP falló:', e);
      return false;
    }
  }
});