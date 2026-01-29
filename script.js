/* script.js - hero scroll + modal + optional Google Apps Script endpoint
   Keep GAS_ENDPOINT empty or set to your Apps Script Web App to store emails in Google Sheets.
*/

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzP7JaFNr8NwlJqtiSknMIES7gKOtlW_QRbPveSEcyePdwhE8Cb6sJ_uB2YYvbGPqTr/exec';

// Load header and footer components
async function loadComponents() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  
  if (headerPlaceholder) {
    try {
      const response = await fetch('header.html');
      const html = await response.text();
      headerPlaceholder.innerHTML = html;
    } catch (e) {
      console.error('Error loading header:', e);
    }
  }
  
  if (footerPlaceholder) {
    try {
      const response = await fetch('footer.html');
      const html = await response.text();
      footerPlaceholder.innerHTML = html;
    } catch (e) {
      console.error('Error loading footer:', e);
    }
  }
}

// Load components first, then initialize everything else
loadComponents().then(() => {
  initApp();
});

function initApp() {
  // HERO: show title in header when header reaches title position
  const hero = document.getElementById('hero');
  const heroTitle = document.getElementById('hero-title');
  let lastScrollY = window.scrollY || window.pageYOffset;
  let ticking = false;
  
  function handleHeroScroll(){
    const y = window.scrollY || window.pageYOffset;
    const header = document.querySelector('.site-header');
    
    if (!header) return;
    
    // Determine scroll direction
    const scrollingDown = y > lastScrollY;
    const scrollingUp = y < lastScrollY;
    
    // When scrolled past initial view
    if (y > 100) {
      document.body.classList.add('scrolled');
      
      if (scrollingDown) {
        document.body.classList.add('scroll-down');
        document.body.classList.remove('scroll-up');
        header.classList.add('scroll-down');
        header.classList.remove('scroll-up');
      } else if (scrollingUp) {
        document.body.classList.add('scroll-up');
        document.body.classList.remove('scroll-down');
        header.classList.add('scroll-up');
        header.classList.remove('scroll-down');
      }
    } else {
      header.classList.remove('scrolled', 'scroll-down', 'scroll-up');
      document.body.classList.remove('scrolled', 'scroll-down', 'scroll-up');
    }
    
    // Apply classes to hero if it exists
    if (hero) {
      if (y > 100) {
        hero.classList.add('scrolled');
        if (scrollingDown) {
          hero.classList.add('scroll-down');
          hero.classList.remove('scroll-up');
        } else if (scrollingUp) {
          hero.classList.add('scroll-up');
          hero.classList.remove('scroll-down');
        }
      } else {
        hero.classList.remove('scrolled', 'scroll-down', 'scroll-up');
      }
    }
    
    lastScrollY = y;
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(handleHeroScroll);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick, { passive: true });
  handleHeroScroll();

  // Hero title click - scroll back to top (for when it's visible in hero)
  if (heroTitle) {
    heroTitle.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Header title click - scroll to top on index page
  const headerTitle = document.querySelector('.header-title');
  if (headerTitle && document.body.classList.contains('page-index')) {
    headerTitle.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Newsletter form handler
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterMessage = document.getElementById('newsletterMessage');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      
      if (!validateEmail(email)) {
        newsletterMessage.textContent = 'Please enter a valid email address.';
        newsletterMessage.style.color = '#ff6b6b';
        return;
      }
      
      newsletterMessage.textContent = 'Subscribing...';
      newsletterMessage.style.color = 'rgba(255,255,255,0.7)';
      
      if (GAS_ENDPOINT) {
        try {
          const payload = { 
            email, 
            product: 'Newsletter Subscription', 
            ts: new Date().toISOString() 
          };
          const ok = await sendToEndpoint(GAS_ENDPOINT, payload);
          
          if (ok) {
            newsletterMessage.textContent = '¡Perfect! Welcome to the movement ✨';
            newsletterMessage.style.color = '#51cf66';
            newsletterForm.reset();
          } else {
            newsletterMessage.textContent = 'Error. Saved locally.';
            newsletterMessage.style.color = '#ff6b6b';
            saveLocal(email, 'Newsletter Subscription');
          }
        } catch (err) {
          newsletterMessage.textContent = 'Connection error. Saved locally.';
          newsletterMessage.style.color = '#ff6b6b';
          saveLocal(email, 'Newsletter Subscription');
        }
      } else {
        saveLocal(email, 'Newsletter Subscription');
        newsletterMessage.textContent = 'Saved locally. Configure GAS_ENDPOINT.';
        newsletterMessage.style.color = '#51cf66';
        newsletterForm.reset();
      }
    });
  }

  // Video ahora se reproduce en todas las pantallas (mobile incluido)

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
          const payload = { email, product, ts: new Date().toISOString() };
          const ok = await sendToEndpoint(GAS_ENDPOINT, payload);
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

      let timer = setTimeout(() => {
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
        cleanup();
        resolve(resp && resp.status === 'ok');
      };

      const s = document.createElement('script');
      s.src = src;
      s.id = callbackName;
      s.onerror = () => { 
        cleanup(); 
        resolve(false); 
      };
      document.head.appendChild(s);
    });
  }

  async function sendToEndpoint(url, payload){
    // Try POST first
    try{
      const res = await fetch(url, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
      if (res && res.ok) return true;
    }catch(err){
      // CORS or network error, try JSONP fallback
    }

    // JSONP fallback: send as GET with callback
    const params = { email: payload.email, product: payload.product, ts: payload.ts };
    return await jsonpRequest(url, params, 9000);
  }

  // Experiences Contact Form Handler
  const expContactForm = document.getElementById('expContactForm');
  const expFormMessage = document.getElementById('expFormMessage');

  if (expContactForm) {
    expContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(expContactForm);
      const data = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono') || '',
        mensaje: formData.get('mensaje'),
        tipo: 'Consulta Experiencia Personalizada',
        ts: new Date().toISOString()
      };
      
      // Validate
      if (!data.nombre || !data.email || !data.mensaje) {
        expFormMessage.textContent = 'Por favor completa todos los campos requeridos.';
        expFormMessage.className = 'exp-form-message error';
        return;
      }
      
      if (!validateEmail(data.email)) {
        expFormMessage.textContent = 'Por favor ingresa un email válido.';
        expFormMessage.className = 'exp-form-message error';
        return;
      }
      
      // Show loading
      expFormMessage.textContent = 'Enviando...';
      expFormMessage.className = 'exp-form-message';
      
      // Send to Google Sheets
      if (GAS_ENDPOINT) {
        try {
          const payload = {
            email: data.email,
            product: `${data.tipo} - ${data.nombre}`,
            mensaje: `Teléfono: ${data.telefono}\nMensaje: ${data.mensaje}`,
            ts: data.ts
          };
          
          const ok = await sendToEndpoint(GAS_ENDPOINT, payload);
          
          if (ok) {
            expFormMessage.textContent = '¡Mensaje enviado! Te contactaremos pronto ✨';
            expFormMessage.className = 'exp-form-message success';
            expContactForm.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
              expFormMessage.textContent = '';
              expFormMessage.className = 'exp-form-message';
            }, 5000);
          } else {
            expFormMessage.textContent = 'Error al enviar. Por favor intenta de nuevo.';
            expFormMessage.className = 'exp-form-message error';
            saveLocal(data.email, data.tipo + ' - ' + data.mensaje);
          }
        } catch (err) {
          expFormMessage.textContent = 'Error de conexión. Intenta de nuevo más tarde.';
          expFormMessage.className = 'exp-form-message error';
          saveLocal(data.email, data.tipo + ' - ' + data.mensaje);
        }
      } else {
        saveLocal(data.email, data.tipo + ' - ' + data.mensaje);
        expFormMessage.textContent = 'Formulario guardado localmente.';
        expFormMessage.className = 'exp-form-message success';
        expContactForm.reset();
      }
    });
  }
} // end initApp