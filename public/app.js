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

// ─── High-Performance Clean 3D Mouse Tilt on Flavor Cards ────────────────────
function initTiltCards() {
  const cards = document.querySelectorAll('.sticker-card, .tilt-card');
  
  cards.forEach(card => {
    let ticking = false;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Fast 15-degree 3D tilt tracking mouse
      const rotateX = (((y - centerY) / centerY) * -15).toFixed(2);
      const rotateY = (((x - centerX) / centerX) * 15).toFixed(2);

      if (!ticking) {
        requestAnimationFrame(() => {
          card.style.transition = 'transform 0.05s ease-out';
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
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
// Theme scroll disabled for solid purple #622791 background

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
  initTiltCards();
  initSmoothScroll();
  initUTMTracking();

  // Lucide icons
  if (window.lucide) lucide.createIcons();
});
