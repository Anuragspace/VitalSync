document.addEventListener('DOMContentLoaded', function() {
    // Animate the header and intro
    gsap.from('.contact-container h1, .team-intro', {
        duration: 1,
        y: -50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Animate the team cards
    const cards = document.querySelectorAll('.team-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                gsap.from(entry.target, {
                    duration: 1,
                    y: 50,
                    opacity: 0,
                    delay: index * 0.2,
                    ease: 'power3.out'
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));

    // Animate the about section
    gsap.from('.about-section', {
        duration: 1,
        scale: 0.9,
        opacity: 0,
        delay: 1,
        ease: 'power3.out'
    });

    // Hover effects for cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelector('.member-image'), {
                duration: 0.4,
                scale: 1.05,
                ease: 'power2.out'
            });
            gsap.to(card.querySelector('.member-info'), {
                duration: 0.4,
                y: -5,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card.querySelector('.member-image'), {
                duration: 0.4,
                scale: 1,
                ease: 'power2.out'
            });
            gsap.to(card.querySelector('.member-info'), {
                duration: 0.4,
                y: 0,
                ease: 'power2.out'
            });
        });
    });

    // Animate social icons
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                duration: 0.3,
                y: -5,
                scale: 1.2,
                ease: 'back.out(1.7)'
            });
        });

        icon.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                duration: 0.3,
                y: 0,
                scale: 1,
                ease: 'back.out(1.7)'
            });
        });
    });
}); 