// Navigation scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Carousel initialization
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = [...document.querySelectorAll('.carousel-slide')];
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    
    // First append clones to the end
    slides.forEach(slide => {
        const endClone = slide.cloneNode(true);
        track.appendChild(endClone);
    });
    // Then prepend clones to the beginning (in reverse order to maintain sequence)
    for (let i = slides.length - 1; i >= 0; i--) {
        const startClone = slides[i].cloneNode(true);
        track.insertBefore(startClone, track.firstChild);
    }
    
    let slidesPerView = getSlidesPerView();
    let slideWidth = 100 / slidesPerView;
    let currentIndex = slides.length; // Start at first slide of original set
    let isTransitioning = false;
    
    // Set initial position with no transition
    track.style.transition = 'none';
    updateTransform(currentIndex);
    // Force a reflow to ensure the initial position is set
    track.offsetHeight;
    track.style.transition = 'transform 0.4s ease-in-out';
    
    function getSlidesPerView() {
        // Ensure we don't try to calculate slides for very narrow widths
        const minWidth = 300;
        const width = Math.max(window.innerWidth, minWidth);
        
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }
    
    function updateTransform(index) {
        track.style.transform = `translateX(-${index * slideWidth}%)`;
    }
    
    function moveSlides(direction) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        track.style.transition = 'transform 0.4s ease-in-out';
        currentIndex += direction;
        updateTransform(currentIndex);
        
        // Reset position after transition
        setTimeout(() => {
            if (currentIndex >= slides.length * 2) {
                track.style.transition = 'none';
                currentIndex = slides.length;
                updateTransform(currentIndex);
            } else if (currentIndex < slides.length) {
                track.style.transition = 'none';
                currentIndex = slides.length * 2 - 1;
                updateTransform(currentIndex);
            }
            setTimeout(() => {
                track.style.transition = 'transform 0.4s ease-in-out';
                isTransitioning = false;
            }, 10);
        }, 400);
    }
    
    // Button Navigation
    next.addEventListener('click', () => moveSlides(1));
    prev.addEventListener('click', () => moveSlides(-1));
    
    // Wheel Navigation
    track.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaX > 50) {
            moveSlides(1);
        } else if (e.deltaX < -50) {
            moveSlides(-1);
        }
    }, { passive: false });
    
    // Handle window resize
    let resizeTimer;
    let lastWidth = window.innerWidth;
    
    function handleResize() {
        const currentWidth = Math.max(window.innerWidth, 300);
        
        // Only process if width actually changed
        if (currentWidth === lastWidth) return;
        lastWidth = currentWidth;
        
        // Disable transitions during resize
        track.style.transition = 'none';
        track.style.width = '100%'; // Ensure track width is maintained
        
        const newSlidesPerView = getSlidesPerView();
        if (newSlidesPerView !== slidesPerView) {
            slidesPerView = newSlidesPerView;
            slideWidth = 100 / slidesPerView;
            
            // Ensure we're still on a valid slide after resize
            currentIndex = Math.min(currentIndex, slides.length * 2 - slidesPerView);
            currentIndex = Math.max(currentIndex, slides.length - slidesPerView);
            
            updateTransform(currentIndex);
        }
        
        // Re-enable transitions after a short delay
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            requestAnimationFrame(() => {
                track.style.transition = 'transform 0.4s ease-in-out';
            });
        }, 50);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Touch/Drag Navigation
    let isDragging = false;
    let startPosition = 0;
    let startIndex = 0;
    
    function dragStart(e) {
        if (isTransitioning) return;
        isDragging = true;
        startPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        startIndex = currentIndex;
        track.style.transition = 'none';
    }
    
    function dragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = (currentPosition - startPosition) / track.offsetWidth * slidesPerView;
        updateTransform(startIndex - diff);
    }
    
    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const currentPosition = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
        const diff = currentPosition - startPosition;
        
        track.style.transition = 'transform 0.4s ease-in-out';
        if (Math.abs(diff) > track.offsetWidth / 4) {
            moveSlides(diff > 0 ? -1 : 1);
        } else {
            updateTransform(currentIndex);
        }
    }
    
    // Touch Events
    track.addEventListener('touchstart', dragStart);
    track.addEventListener('touchmove', dragMove);
    track.addEventListener('touchend', dragEnd);
    
    // Mouse Events
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', dragMove);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
}); 