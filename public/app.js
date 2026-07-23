/* =========================================================================
   CLUBS DRAFT NIGHT — CINEMATOGRAPHIC INTERACTIONS
   ========================================================================= */

// ─── Splash Screen ────────────────────────────────────────────────────────────
function initSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  document.body.classList.add('splash-active');
  
  setTimeout(() => {
    splash.classList.add('hidden');
    document.body.classList.remove('splash-active');
  }, 1800);
}

// ─── Countdown Timer com Flip ─────────────────────────────────────────────────
function initCountdown() {
  const eventDate = new Date('2026-08-29T18:00:00-03:00').getTime();
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };

  if (!els.days) return;

  let prev = { days: '', hours: '', mins: '', secs: '' };

  function update() {
    const diff = eventDate - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach(el => { el.querySelector('span').textContent = '00'; });
      return;
    }

    const vals = {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
      mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      secs: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    };

    Object.keys(vals).forEach(key => {
      const el = els[key];
      const span = el.querySelector('span');
      if (vals[key] !== prev[key]) {
        span.textContent = vals[key];
        el.classList.remove('flip');
        // Force reflow to restart animation
        void el.offsetWidth;
        el.classList.add('flip');
      }
    });

    prev = { ...vals };
  }

  update();
  setInterval(update, 1000);
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

// ─── Scroll Animations (IntersectionObserver) ─────────────────────────────────
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.observe-me').forEach(el => el.classList.add('in-view'));
    document.querySelectorAll('.stagger-item').forEach(el => el.classList.add('stagger-visible'));
    return;
  }

  // Standard fade-in
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observe-me').forEach(el => fadeObserver.observe(el));

  // Staggered reveal for children
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.stagger-item');
        items.forEach((item, i) => {
          setTimeout(() => {
            item.classList.add('stagger-visible');
          }, i * 120);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // Observe parent containers that have stagger-items
  document.querySelectorAll('.cards-grid, .lineup-grid, .venue-gallery, .faq-container').forEach(el => {
    staggerObserver.observe(el);
  });
}


// ─── Parallax on Hero ─────────────────────────────────────────────────────────
function initParallax() {
  const parallaxEl = document.querySelector('.hero-parallax-bg');
  if (!parallaxEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const speed = parseFloat(parallaxEl.dataset.parallax) || 0.3;
        parallaxEl.style.transform = `translateY(${scrollY * speed}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ─── 3D Tilt on Cards ─────────────────────────────────────────────────────────
function initTiltCards() {
  if ('ontouchstart' in window) return; // Skip on touch devices

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


// ─── Smooth Scroll ────────────────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ─── Init Everything ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initCountdown();
  initFAQ();
  initScrollAnimations();
  initParallax();
  initTiltCards();
  initSmoothScroll();

  // Lucide icons
  if (window.lucide) lucide.createIcons();
});
