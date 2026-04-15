/* =====================================================
   Carrera's – Servicios Automotrices
   script.js
   ===================================================== */

/* ── Utilidades ─────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ── Estado ─────────────────────────────────────────── */
let menuOpen = false;

/* ── DOM Elements ───────────────────────────────────── */
const header    = $('#header');
const burger    = $('#burger');
const nav       = $('#nav');
const backTop   = $('#backTop');
const navLinks  = $$('.nav__link');
const sections  = $$('section[id]');

/* ============================================================
   1. HEADER: scroll + active nav link
   ============================================================ */
function onScroll() {
  const scrollY = window.scrollY;

  // Sticky header style
  header.classList.toggle('scrolled', scrollY > 60);

  // Back-to-top button
  backTop.classList.toggle('visible', scrollY > 500);

  // Active nav link based on section in view
  sections.forEach((section) => {
    const top    = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = $(`.nav__link[href="#${id}"]`);

    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < bottom);
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ============================================================
   2. MOBILE MENU
   ============================================================ */
burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  burger.classList.toggle('open', menuOpen);
  nav.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});

// Close on nav link click
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    menuOpen = false;
    burger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (menuOpen && !nav.contains(e.target) && !burger.contains(e.target)) {
    menuOpen = false;
    burger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   3. REVEAL ON SCROLL (IntersectionObserver)
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings in a parent container
        const siblings = $$(
          `${entry.target.parentElement.tagName} > .reveal`
        ).filter((el) => !el.classList.contains('visible'));

        entry.target.style.transitionDelay = `${i * 0.05}s`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

$$('.reveal').forEach((el) => revealObserver.observe(el));

/* ============================================================
   4. COUNTER ANIMATION (stats bar)
   ============================================================ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step     = (target / duration) * 16; // ~60fps
  let current    = 0;

  const tick = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

$$('.stat__num').forEach((el) => statObserver.observe(el));

/* ============================================================
   5. BACK TO TOP button
   ============================================================ */
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   6. CONTACT FORM – basic validation + feedback
   ============================================================ */
const contactForm = $('#contactForm');
const formStatus  = $('#formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const message = $('#message').value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate
    if (!name || !email || !message) {
      showStatus('Por favor, completa todos los campos requeridos.', 'error');
      return;
    }
    if (!emailRe.test(email)) {
      showStatus('Ingresa un correo electrónico válido.', 'error');
      return;
    }

    // Simulate send (replace with real endpoint when ready)
    const btn = contactForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    await new Promise((r) => setTimeout(r, 1500)); // simulate network delay

    showStatus(
      '✅ ¡Mensaje enviado! Nos pondremos en contacto pronto.',
      'success'
    );
    contactForm.reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar mensaje';
  });
}

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className   = `form-status ${type}`;
  setTimeout(() => (formStatus.textContent = ''), 5000);
}

/* ============================================================
   7. FOOTER year
   ============================================================ */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   8. SMOOTH ANCHOR for browsers that don't support CSS
   scroll-behavior (legacy Safari)
   ============================================================ */
$$('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY
      - parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h'), 10);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   9. GALLERY lightbox (simple)
   ============================================================ */
function createLightbox() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,.92)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    cursor: 'zoom-out',
    backdropFilter: 'blur(8px)',
  });

  const img = document.createElement('img');
  Object.assign(img.style, {
    maxWidth: '100%',
    maxHeight: '90vh',
    borderRadius: '4px',
    boxShadow: '0 24px 80px rgba(0,0,0,.8)',
    objectFit: 'contain',
  });

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => overlay.remove());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.remove();
  }, { once: true });

  return img;
}

$$('.gallery__item').forEach((item) => {
  item.addEventListener('click', () => {
    const src    = item.querySelector('img').src;
    const lbImg  = createLightbox();
    lbImg.src    = src;
    lbImg.alt    = item.querySelector('.gallery__label')?.textContent || '';
  });
});

/* ============================================================
   10. SERVICE CARD stagger on load
   ============================================================ */
$$('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});
