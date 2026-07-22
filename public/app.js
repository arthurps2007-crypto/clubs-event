// ─── Máscara de Telefone ──────────────────────────────────────────────────────
function initPhoneMask() {
  const tel = document.getElementById('telefone');
  if (!tel) return;

  tel.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    this.value = v;
  });
}

// ─── Formulário de Cadastro ───────────────────────────────────────────────────
function initForm() {
  const form = document.getElementById('form-cadastro');
  const btnSubmit = document.getElementById('btn-submit');
  const formError = document.getElementById('form-error');

  if (!form || !btnSubmit || !formError) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.style.display = 'none';

    // Validação client-side
    const nome = document.getElementById('nome');
    const telefone = document.getElementById('telefone');
    const email = document.getElementById('email');
    const cidade = document.getElementById('cidade');

    if (!nome || !telefone || !email || !cidade) return;

    const nomeVal = nome.value.trim();
    const telVal = telefone.value.trim();
    const emailVal = email.value.trim();
    const cidadeVal = cidade.value.trim();

    // Validação de telefone: pelo menos 14 chars = (XX) XXXXX-XXXX
    if (telVal.replace(/\D/g, '').length < 10) {
      formError.textContent = 'Informe um telefone válido com DDD.';
      formError.style.display = 'block';
      return;
    }

    // Validação de email básica
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      formError.textContent = 'Informe um e-mail válido.';
      formError.style.display = 'block';
      return;
    }

    // Estado de loading
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'GERANDO...';
    btnSubmit.classList.add('btn-loading');

    try {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeVal,
          telefone: telVal,
          email: emailVal,
          cidade: cidadeVal,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao cadastrar. Tente novamente.');
      }

      sessionStorage.setItem('clubs_lead', JSON.stringify({
        nome: json.nome,
        codigo: json.codigo,
        qrCodeDataUrl: json.qrCodeDataUrl,
      }));

      window.location.href = '/sucesso';

    } catch (err) {
      formError.textContent = err.message;
      formError.style.display = 'block';
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'GERAR PASSE VIP 🎫';
      btnSubmit.classList.remove('btn-loading');
    }
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
        observer.unobserve(entry.target); // Stop observing once animated in
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observe-me').forEach(el => observer.observe(el));
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPhoneMask();
  initForm();
  initSmoothScroll();
  initScrollAnimations();
});
