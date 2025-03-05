// JavaScript for interactive elements (if needed)
document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all feature sections
    document.querySelectorAll('.feature-section').forEach(section => {
        observer.observe(section);
    });

    // Add mobile menu functionality
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    // Hide/show navbar on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });

    // Add mobile menu toggle
    const createMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-menu-btn';
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        navbar.insertBefore(hamburger, navbar.querySelector('.about-us-btn'));
    };

    if (window.innerWidth <= 768) {
        createMobileMenu();
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            createMobileMenu();
        } else if (window.innerWidth > 768) {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (mobileBtn) mobileBtn.remove();
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});