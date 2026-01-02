/* script.js - hero scroll + modal + optional Google Apps Script endpoint
   Keep GAS_ENDPOINT empty or set to your Apps Script Web App to store emails in Google Sheets.
*/

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyGuznceRUR_ivxa0qSdgUGhEsyBGYoH26VH40JZi-Lq_Cr-BnmCDRH5g87zs2yAqy9/exec'; // Web App URL (actualizado por el usuario)

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
          const payload = { email, product, ts: new Date().toISOString() };
          const res = await fetch(GAS_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
          if (res.ok){
            buyMsg.textContent = '¡Listo! Te avisaremos cuando esté disponible.';
            buyMsg.style.color = '#b8ffd6';
            buyForm.reset();
          } else {
            buyMsg.textContent = 'Error al enviar. Guardado localmente.';
            buyMsg.style.color = '#ffb0b0';
            saveLocal(email, product);
          }
        }catch(err){
          console.error(err);
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
});