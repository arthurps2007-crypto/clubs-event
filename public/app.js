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
});
