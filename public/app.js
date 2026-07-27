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
    
    // NOTE: Drag-to-scroll logic was removed as requested to keep the scrolling
    // native, optimized, and bug-free on all devices. 
    // The `.carousel-grid` now relies entirely on native CSS `overflow-x: auto` 
    // and `scroll-snap-type`.
});
