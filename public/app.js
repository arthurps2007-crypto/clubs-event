/* =========================================================================
   CLUBS DRAFT NIGHT — BASIC APP.JS (OPTIMIZED & BUG-FREE)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SIMPLE COUNTDOWN (DAYS ONLY)
    const countSpan = document.getElementById('days-count');
    if (countSpan) {
        // Target date: August 29, 2026
        const targetDate = new Date('2026-08-29T18:00:00-03:00').getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const difference = targetDate - now;
            
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                countSpan.textContent = days;
            } else {
                countSpan.textContent = "0";
            }
        }
        
        updateCountdown();
        // Update once a day (or just on load is fine, but setInterval keeps it fresh)
        setInterval(updateCountdown, 1000 * 60 * 60); 
    }
    
    // 2. DRAG TO SCROLL CAROUSEL & INFINITE LOOP
    const slider = document.querySelector('.carousel-grid');
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    if (slider) {
        // --- INFINITE LOOP CLONE ---
        // Duplica os cartões para criar a ilusão de infinito
        const cards = Array.from(slider.children);
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            slider.appendChild(clone);
        });

        // --- DRAG LOGIC ---
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            slider.classList.add('active-drag');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active-drag');
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active-drag');
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            isDragging = true;
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; 
            slider.scrollLeft = scrollLeft - walk;
        });

        slider.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // --- INFINITE SCROLL JUMP ---
        slider.addEventListener('scroll', () => {
            // Se scroll chegou exatamente no limite da esquerda (começo absoluto)
            if (slider.scrollLeft === 0) {
                slider.scrollLeft = slider.scrollWidth / 2;
            } 
            // Se scroll chegou no limite da direita da primeira metade
            else if (slider.scrollLeft >= slider.scrollWidth / 2) {
                slider.scrollLeft = slider.scrollLeft - (slider.scrollWidth / 2);
            }
        });
    }

    // 3. INIT ICONS
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
