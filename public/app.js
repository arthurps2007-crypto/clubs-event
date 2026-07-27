/* =========================================================================
   CLUBS DRAFT NIGHT — CINEMATOGRAPHIC INTERACTIONS
   ========================================================================= */



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

// ─── Senior Dev Theme Transition on Scroll ────────────────────────────────────
function initThemeScroll() {
  const sections = document.querySelectorAll('section[data-theme]');
  if (!sections.length) return;

  function updateTheme() {
    const viewportCenter = window.innerHeight * 0.45;
    let activeTheme = null;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        activeTheme = sec.dataset.theme;
      }
    });

    if (activeTheme && document.body.dataset.theme !== activeTheme) {
      document.body.dataset.theme = activeTheme;
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTheme();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateTheme();
}

// ─── UTM Parameter Tracking & Lead Preservation ──────────────────────────────
function initUTMTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const activeParams = [];

  utmKeys.forEach(key => {
    if (urlParams.has(key)) {
      activeParams.push(`${key}=${encodeURIComponent(urlParams.get(key))}`);
    }
  });

  if (activeParams.length > 0) {
    const utmString = activeParams.join('&');
    const ctaButtons = document.querySelectorAll('a[href*="whatsapp.com"], a[href*="wa.me"], .btn-hero, .btn-cta-final');
    
    ctaButtons.forEach(btn => {
      const currentHref = btn.getAttribute('href');
      if (currentHref && currentHref !== '#') {
        const separator = currentHref.includes('?') ? '&' : '?';
        btn.setAttribute('href', `${currentHref}${separator}${utmString}`);
      }
    });
  }
}

// ─── Init Everything ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFAQ();
  initScrollAnimations();
  initParallax();
  initTiltCards();
  initSmoothScroll();
  initThemeScroll();
  initUTMTracking();

  // Lucide icons
  if (window.lucide) lucide.createIcons();
});
