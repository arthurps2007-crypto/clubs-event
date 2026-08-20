/* =========================================================================
   CLUBS DRAFT NIGHT — BASIC APP.JS (OPTIMIZED & BUG-FREE)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SIMPLE COUNTDOWN (DAYS ONLY)
    const countSpans = document.querySelectorAll('.days-count');
    if (countSpans.length > 0) {
        // Target date: August 29, 2026
        const targetDate = new Date('2026-08-29T18:00:00-03:00').getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const difference = targetDate - now;
            let daysText = "0";
            
            if (difference > 0) {
                daysText = Math.floor(difference / (1000 * 60 * 60 * 24)).toString();
            }
            
            countSpans.forEach(span => { span.textContent = daysText; });
        }
        
        updateCountdown();
        // Update once a day (or just on load is fine, but setInterval keeps it fresh)
        setInterval(updateCountdown, 1000 * 60 * 60); 
    }
    
    // 2. DRAG TO SCROLL CAROUSEL & INFINITE LOOP (MOMENTUM)
    const slider = document.querySelector('.carousel-grid');
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;
    
    // Variáveis para a física de inércia (rolada longa)
    let velX = 0;
    let momentumID;

    if (slider) {
        const cards = Array.from(slider.children);
        
        // 1. Clona no final
        cards.forEach(card => {
            slider.appendChild(card.cloneNode(true));
        });
        
        // 2. Clona no início (para podermos rolar para a esquerda infinitamente)
        const prependFragment = document.createDocumentFragment();
        cards.forEach(card => {
            prependFragment.appendChild(card.cloneNode(true));
        });
        slider.insertBefore(prependFragment, slider.firstChild);

        // 3. Joga o scroll para o meio (onde estão os originais)
        // Usamos setTimeout para garantir que o CSS/layout foi calculado
        setTimeout(() => {
            slider.scrollLeft = slider.scrollWidth / 3;
        }, 50);

        // Função do loop de inércia (deslize extra ao soltar)
        function beginMomentumLoop() {
            slider.scrollLeft += velX;
            velX *= 0.90; // Fricção
            if (Math.abs(velX) > 0.5) {
                momentumID = requestAnimationFrame(beginMomentumLoop);
            }
        }

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            slider.classList.add('active-drag');
            cancelAnimationFrame(momentumID); 
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('mouseleave', () => {
            if(!isDown) return;
            isDown = false;
            slider.classList.remove('active-drag');
            beginMomentumLoop(); 
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active-drag');
            beginMomentumLoop(); 
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            isDragging = true;
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1; 
            
            const prevScrollLeft = slider.scrollLeft;
            slider.scrollLeft = scrollLeft - walk;
            velX = slider.scrollLeft - prevScrollLeft;
        });

        slider.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // --- INFINITE SCROLL JUMP (BOTH SIDES) ---
        slider.addEventListener('scroll', () => {
            const third = slider.scrollWidth / 3;
            // Se rolar pra esquerda (chegando perto do limite)
            if (slider.scrollLeft < 10) {
                slider.scrollLeft += third;
            } 
            // Se rolar pra direita (passando do limite)
            else if (slider.scrollLeft > (third * 2) - 10) {
                slider.scrollLeft -= third;
            }
        });
    }


    // 3. INIT ICONS
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 3.5. PHONE MASK
    const phoneInput = document.getElementById('leadPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    // 4. CAPTURE FORM SUBMIT LOGIC
    const captureForm = document.getElementById('captureForm');
    if (captureForm) {
        let isSubmitting = false; // Trava contra duplo clique

        captureForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return; // Se já estiver enviando, ignora novos cliques
            
            const formData = new FormData(captureForm);
            const rawPhone = formData.get('whatsapp') || '';
            const rawEmail = formData.get('email') || '';

            // Validação de Nome
            const nomeClean = formData.get('nome') ? formData.get('nome').trim() : '';
            if (nomeClean.length < 2 || /\d/.test(nomeClean)) {
                alert("Por favor, insira um nome válido (apenas letras).");
                return;
            }

            // Validação de E-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(rawEmail.trim())) {
                alert("Por favor, insira um e-mail válido.");
                return;
            }

            // Validação de WhatsApp
            const phoneClean = rawPhone.replace(/\D/g, '');
            if (phoneClean.length < 10 || phoneClean.length > 11) {
                alert("O WhatsApp deve ter 10 ou 11 números (com DDD). Verifique se não digitou a mais ou a menos.");
                return;
            }
            const isAllSame = phoneClean.split('').every(char => char === phoneClean[0]);
            if (isAllSame) {
                alert("Número de WhatsApp inválido (não pode ter todos os números iguais).");
                return;
            }

            // Bloqueia o form visualmente e via código
            isSubmitting = true;
            const btn = captureForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.textContent = 'AGUARDE...';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                btn.disabled = true;
            }

            // Captura UTMs da URL (Tráfego Pago)
            const urlParams = new URLSearchParams(window.location.search);
            const utm_source = urlParams.get('utm_source') || '';
            const utm_medium = urlParams.get('utm_medium') || '';
            const utm_campaign = urlParams.get('utm_campaign') || '';
            const utm_term = urlParams.get('utm_term') || '';
            const utm_content = urlParams.get('utm_content') || '';

            const data = {
                nome: nomeClean,
                email: rawEmail.trim(),
                whatsapp: rawPhone,
                utm_source,
                utm_medium,
                utm_campaign,
                utm_term,
                utm_content
            };

            const WEBHOOK_URL = "https://novo-clubs.onrender.com/webhook/captura-evento";

            // 1. WEBHOOK EM PARALELO (fire-and-forget)
            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true
            }).catch(e => console.error("Webhook error:", e));

            // 2. DISPARA O LEAD E ESPERA A CONFIRMAÇÃO DO FACEBOOK ANTES DE REDIRECIONAR
            const wppUrl = "https://chat.whatsapp.com/IWrimwZMKZ1AZLDoMZ5RBO";
            
            if (window.fbq) {
                // Configura um timeout de segurança de 2 segundos caso o Facebook demore
                let redirected = false;
                const safeRedirect = () => {
                    if (!redirected) {
                        redirected = true;
                        window.location.href = wppUrl;
                    }
                };
                
                setTimeout(safeRedirect, 2000); // Fallback máximo de 2s

                // Envia Email e Telefone (Advanced Matching) para o Facebook melhorar a inteligência da campanha
                const advancedMatching = {
                    em: rawEmail.trim().toLowerCase(),
                    ph: '55' + phoneClean // Assume Brasil (55)
                };

                // O Facebook avisa neste callback quando o evento foi salvo nos servidores deles
                window.fbq('trackCustom', 'DEUS', advancedMatching, safeRedirect);
            } else {
                // Se o AdBlock bloqueou o Facebook, redireciona direto
                window.location.href = wppUrl;
            }
        });
    }
});

// FUNÇÕES GLOBAIS PARA A MODAL
function openModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('captureModal');
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('captureModal');
    if (modal) modal.classList.remove('active');
}

// Lazy load Google Maps
const mapIframe = document.getElementById('venue-map-iframe');
if(mapIframe) {
  const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const iframe = entry.target;
        if(iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          mapObserver.unobserve(iframe);
        }
      }
    });
  }, { rootMargin: '200px' });
  mapObserver.observe(mapIframe);
}
