// ─── Contador regressivo ──────────────────────────────────────────────────────
function startCountdown() {
  const eventDate = new Date('2026-08-29T20:00:00-03:00');

  function update() {
    const now = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<div class="countdown__ended">O evento está acontecendo agora! 🎉</div>';
      return;
    }

    const dias     = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas    = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('dias').textContent     = String(dias).padStart(2, '0');
    document.getElementById('horas').textContent    = String(horas).padStart(2, '0');
    document.getElementById('minutos').textContent  = String(minutos).padStart(2, '0');
    document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ─── Formulário de Cadastro ───────────────────────────────────────────────────
function initForm() {
  const form      = document.getElementById('form-cadastro');
  const btnSubmit = document.getElementById('btn-submit');
  const formError = document.getElementById('form-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.style.display = 'none';
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Aguarde...';

    const data = {
      nome:      document.getElementById('nome').value.trim(),
      telefone:  document.getElementById('telefone').value.trim(),
      email:     document.getElementById('email').value.trim(),
      cidade:    document.getElementById('cidade').value.trim(),
    };

    try {
      const res  = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao cadastrar. Tente novamente.');
      }

      // Guardar dados no sessionStorage para a página de sucesso
      sessionStorage.setItem('clubs_lead', JSON.stringify({
        nome:          json.nome,
        codigo:        json.codigo,
        qrCodeDataUrl: json.qrCodeDataUrl,
      }));

      window.location.href = '/sucesso';

    } catch (err) {
      formError.textContent  = err.message;
      formError.style.display = 'block';
      btnSubmit.disabled     = false;
      btnSubmit.textContent  = 'GERAR MEU QR CODE (GRATUITO)';
    }
  });
}

// ─── Scroll suave para âncoras ────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ─── Intersection Observer para animações no Scroll ───────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observe-me').forEach(el => observer.observe(el));
}

// ─── Init ─────────────────────────────────────────────────────────────────────
startCountdown();
initForm();
initSmoothScroll();
initScrollAnimations();

