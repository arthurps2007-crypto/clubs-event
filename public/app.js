// ─── Countdown Timer ──────────────────────────────────────────────────────────
function initCountdown() {
  // 29 de agosto de 2026, 18h (horário de abertura)
  const eventDate = new Date('2026-08-29T18:00:00-03:00').getTime();

  function update() {
    const now = Date.now();
    const diff = eventDate - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Fecha todos os outros
      items.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      
      // Toggle o clicado
      item.classList.toggle('active', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

// ─── Scroll suave para âncoras ────────────────────────────────────────────────
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

// ─── Intersection Observer para animações no Scroll ───────────────────────────
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately on old browsers
    document.querySelectorAll('.observe-me').forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observe-me').forEach(el => observer.observe(el));
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initFAQ();
  initSmoothScroll();
  initScrollAnimations();
});
