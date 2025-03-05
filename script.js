// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add hover effect for navigation links
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.opacity = '0.8';
    });
    link.addEventListener('mouseleave', () => {
        link.style.opacity = '1';
    });
});

// Add click animation for About Us button
const aboutBtn = document.querySelector('.about-btn');
aboutBtn.addEventListener('click', () => {
    aboutBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        aboutBtn.style.transform = 'scale(1)';
    }, 100);
});

// Scroll handling with enhanced animations
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const scrollThreshold = 50;
    const heroHeight = window.innerHeight;
    
    if (currentScroll > scrollThreshold) {
        document.body.classList.add('scrolled');
        
        // Calculate scroll progress (0 to 1)
        const scrollProgress = Math.min(currentScroll / heroHeight, 1);
        
        // Update background transition
        const backgroundTransition = document.querySelector('.background-transition');
        backgroundTransition.style.transform = `translateY(${100 - (scrollProgress * 100)}%)`;
        
        // Update main text with gradient and position
        const mainText = document.querySelector('.main-text');
        if (mainText) {
            mainText.style.transform = `translateY(${currentScroll * 0.2}px)`;
            mainText.style.opacity = 1;
            mainText.style.background = 'linear-gradient(135deg, #4169e1 0%, #5c7ff7 100%)';
            mainText.style.webkitBackgroundClip = 'text';
            mainText.style.webkitTextFillColor = 'transparent';
            mainText.style.backgroundClip = 'text';
            mainText.style.color = 'transparent';
        }

        // Update bottom content
        const bottomContent = document.querySelector('.bottom-content');
        if (bottomContent) {
            bottomContent.style.transform = `translateY(${currentScroll * 0.1}px)`;
            bottomContent.style.opacity = 1;
            bottomContent.style.color = '#4169e1';
        }

        // Update social icons color
        const socialIcons = document.querySelectorAll('.social-icon');
        socialIcons.forEach(icon => {
            icon.style.color = '#4169e1';
            icon.style.opacity = 1;
        });
        
        // Update circles position with enhanced easing
        const circles = document.querySelectorAll('.circle');
        circles.forEach((circle, index) => {
            const delay = index * 0.1;
            const ease = t => t<.5 ? 2*t*t : -1+(4-2*t)*t; // Custom easing function
            const transformProgress = ease(Math.min(scrollProgress + delay, 1));
            circle.style.transform = `translateY(${-currentScroll * 0.5 * transformProgress}px)`;
        });
        
    } else {
        document.body.classList.remove('scrolled');
        
        // Reset all transforms and styles
        const mainText = document.querySelector('.main-text');
        const bottomContent = document.querySelector('.bottom-content');
        const backgroundTransition = document.querySelector('.background-transition');
        const circles = document.querySelectorAll('.circle');
        const socialIcons = document.querySelectorAll('.social-icon');
        
        if (mainText) {
            mainText.style.transform = 'translateY(0)';
            mainText.style.opacity = 1;
            mainText.style.background = 'none';
            mainText.style.webkitTextFillColor = 'white';
            mainText.style.color = 'white';
        }
        
        if (bottomContent) {
            bottomContent.style.transform = 'translateY(0)';
            bottomContent.style.opacity = 1;
            bottomContent.style.color = 'white';
        }
        
        backgroundTransition.style.transform = 'translateY(100%)';
        
        circles.forEach(circle => {
            circle.style.transform = 'translateY(0)';
        });

        socialIcons.forEach(icon => {
            icon.style.color = 'white';
            icon.style.opacity = 1;
        });
    }

    // Add smooth parallax effect for depth
    const parallaxElements = document.querySelectorAll('.hero-content > *');
    parallaxElements.forEach((element, index) => {
        const speed = 1 - (index * 0.1);
        const yPos = -(currentScroll * speed);
        element.style.transform = `translate3D(0, ${yPos}px, 0)`;
    });
});

// Add smooth transition class when page loads
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('transitions-enabled');
});

// Enhanced ECG Animation
class ECGAnimator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.phase = 0;
        this.isPlaying = true;  // Track animation state
        this.animationFrameId = null;
        
        this.settings = {
            normalColor: '#00ff00',
            lineWidth: 2,
            gridColor: 'rgba(255, 255, 255, 0.1)',
            speed: 0.8,
            amplitude: 1.2,
            baselineY: null,
            pointSpacing: 1
        };
        
        this.setupCanvas();
        this.initializePoints();
        this.setupPlayPauseButton();  // Add button handler

        // Add base values and ranges for vitals
        this.vitals = {
            hr: { base: 72, min: 70, max: 75, current: 72, element: document.querySelector('.indicator:nth-child(1) .value') },
            pr: { base: 160, min: 155, max: 165, current: 160, element: document.querySelector('.indicator:nth-child(2) .value') },
            qt: { base: 380, min: 375, max: 385, current: 380, element: document.querySelector('.indicator:nth-child(3) .value') },
            qrs: { base: 90, min: 88, max: 92, current: 90, element: document.querySelector('.indicator:nth-child(4) .value') }
        };

        this.updateVitals();

        // Setup download button
        this.setupDownloadButton();
    }

    setupPlayPauseButton() {
        const playButton = document.querySelector('.control-btn.active');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.togglePlayPause(playButton);
            });
        }
    }

    togglePlayPause(button) {
        this.isPlaying = !this.isPlaying;
        const icon = button.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            this.drawECG();
            this.updateVitals(); // Resume vital signs updates
        } else {
            icon.className = 'fas fa-play';
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
        }
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size accounting for device pixel ratio
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale context for retina displays
        this.ctx.scale(dpr, dpr);
        
        // Set display size
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        this.settings.baselineY = rect.height / 2;

        // Adjust line width for mobile
        if (window.innerWidth <= 768) {
            this.settings.lineWidth = 1.5;
            this.settings.pointSpacing = 0.8;
        } else {
            this.settings.lineWidth = 2;
            this.settings.pointSpacing = 1;
        }
    }

    initializePoints() {
        this.points = [];
        const rect = this.canvas.getBoundingClientRect();
        for (let x = 0; x < rect.width; x += this.settings.pointSpacing) {
            this.points.push(this.generateECGPoint(x));
        }
    }

    generateECGPoint(x) {
        const y = this.settings.baselineY;
        let offset = 0;
        const a = this.settings.amplitude;

        // Normal ECG wave pattern
        if (this.phase < 0.1) {
            // P wave
            const p = this.phase / 0.1;
            offset = 12 * Math.sin(p * Math.PI) * a;
        } 
        else if (this.phase < 0.15) {
            // PR segment
            offset = 0;
        }
        else if (this.phase < 0.2) {
            // Q wave
            const q = (this.phase - 0.15) / 0.05;
            offset = -15 * Math.pow(q, 2) * a;
        }
        else if (this.phase < 0.25) {
            // R wave
            const r = (this.phase - 0.2) / 0.05;
            offset = (-15 + 90 * Math.pow(Math.sin(r * Math.PI / 2), 2)) * a;
        }
        else if (this.phase < 0.3) {
            // S wave
            const s = (this.phase - 0.25) / 0.05;
            offset = (75 - 90 * Math.pow(1 - s, 2)) * a;
        }
        else if (this.phase < 0.4) {
            // ST segment
            offset = 0;
        }
        else if (this.phase < 0.7) {
            // T wave
            const t = (this.phase - 0.4) / 0.3;
            offset = 25 * Math.pow(Math.sin(t * Math.PI), 2) * a;
        }

        return { 
            x, 
            y: y - offset
        };
    }

    drawGrid() {
        const rect = this.canvas.getBoundingClientRect();
        const gridSize = 20;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.settings.gridColor;
        
        for (let x = 0; x < rect.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, rect.height);
        }
        
        for (let y = 0; y < rect.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(rect.width, y);
        }
        
        this.ctx.stroke();
    }

    drawECG() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        this.drawGrid();

        // Draw ECG line
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.settings.normalColor;
        this.ctx.lineWidth = this.settings.lineWidth;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        
        this.points.forEach((point, i) => {
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        
        this.ctx.stroke();

        if (this.isPlaying) {
            this.phase += 0.006 * this.settings.speed;
            if (this.phase >= 1) {
                this.phase = 0;
                // Add slight variation to amplitude on each cycle
                this.settings.amplitude = 1.2 + (Math.random() * 0.1 - 0.05);
            }

            this.points.push(this.generateECGPoint(rect.width));
            this.points.forEach(point => point.x -= this.settings.pointSpacing * this.settings.speed);
            
            while (this.points.length > 0 && this.points[0].x < 0) {
                this.points.shift();
            }

            this.animationFrameId = requestAnimationFrame(() => this.drawECG());
        }
    }

    updateVitals() {
        // Update each vital sign with small random fluctuations
        for (const [key, vital] of Object.entries(this.vitals)) {
            // Generate small random change
            const change = Math.random() * 2 - 1; // Random value between -1 and 1
            
            // Update current value with smooth transition
            vital.current += change;
            
            // Keep within bounds
            if (vital.current < vital.min) vital.current = vital.min;
            if (vital.current > vital.max) vital.current = vital.max;
            
            // Update display with rounded value
            if (vital.element) {
                vital.element.textContent = Math.round(vital.current);
            }
        }

        // Schedule next update
        if (this.isPlaying) {
            setTimeout(() => this.updateVitals(), 1000); // Update every second
        }
    }

    setupDownloadButton() {
        const downloadButton = document.querySelector('.control-btn i.fa-download').parentElement;
        if (downloadButton) {
            downloadButton.addEventListener('click', () => this.downloadECGImage());
        }
    }

    downloadECGImage() {
        // Create a temporary canvas to combine all elements
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Get monitor frame element
        const monitorFrame = document.querySelector('.monitor-frame');
        const rect = monitorFrame.getBoundingClientRect();
        
        // Set canvas size to match monitor frame
        tempCanvas.width = rect.width * 2; // Higher resolution
        tempCanvas.height = rect.height * 2;
        tempCtx.scale(2, 2); // Improve quality
        
        // Set background
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, rect.width, rect.height);
        
        // Draw vital indicators
        this.drawVitalsToCanvas(tempCtx, 0, 0, rect.width);
        
        // Draw ECG grid and wave
        const gridArea = document.querySelector('.ecg-grid').getBoundingClientRect();
        tempCtx.drawImage(this.canvas, 
            0, 0, this.canvas.width, this.canvas.height,
            gridArea.left - rect.left, gridArea.top - rect.top, gridArea.width, gridArea.height
        );
        
        // Draw monitor stats
        this.drawStatsToCanvas(tempCtx, 0, rect.height - 30, rect.width);
        
        // Generate timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Create download link
        const link = document.createElement('a');
        link.download = `ECG-Monitor-${timestamp}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        
        // Trigger download
        link.click();
    }

    drawVitalsToCanvas(ctx, x, y, width) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#00ff00';
        
        // Draw vital signs
        const vitals = [
            `HR ${Math.round(this.vitals.hr.current)} bpm`,
            `PR ${Math.round(this.vitals.pr.current)} ms`,
            `QT ${Math.round(this.vitals.qt.current)} ms`,
            `QRS ${Math.round(this.vitals.qrs.current)} ms`
        ];
        
        const spacing = width / vitals.length;
        vitals.forEach((vital, i) => {
            ctx.fillText(vital, x + spacing * i + 10, y + 20);
        });
    }

    drawStatsToCanvas(ctx, x, y, width) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ffffff';
        
        // Draw bottom stats
        const stats = [
            'SpO2 98%',
            'RESP 16',
            'TEMP 36.8°C'
        ];
        
        const spacing = width / stats.length;
        stats.forEach((stat, i) => {
            ctx.fillText(stat, x + spacing * i + 10, y + 20);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ecgCanvas');
    if (canvas) {
        const animator = new ECGAnimator(canvas);
        animator.drawECG();

        window.addEventListener('resize', () => {
            animator.setupCanvas();
            animator.initializePoints();
        });
    }
});

// Add intersection observer for scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(element => {
    observer.observe(element);
});

// Add resize handler
window.addEventListener('resize', () => {
    const canvas = document.getElementById('ecgCanvas');
    if (canvas && canvas.animator) {
        canvas.animator.setupCanvas();
        canvas.animator.initializePoints();
    }
});

// Add orientation change handler
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        const canvas = document.getElementById('ecgCanvas');
        if (canvas && canvas.animator) {
            canvas.animator.setupCanvas();
            canvas.animator.initializePoints();
        }
    }, 100);
});

// Enhanced parallax effect
function updateParallax() {
    const currentScroll = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content > *');
    
    parallaxElements.forEach((element, index) => {
        // Enhanced depth effect with exponential scaling
        const depth = Math.pow(0.85, index);
        const yPos = -(currentScroll * depth);
        
        // Add subtle rotation for more dynamic effect
        const rotation = currentScroll * 0.02 * depth;
        
        // Use transform3d for better performance
        element.style.transform = `translate3d(0, ${yPos}px, 0) rotateX(${rotation}deg)`;
        
        // Add subtle scale effect
        const scale = 1 - (currentScroll * 0.0005 * depth);
        element.style.transform += ` scale(${Math.max(scale, 0.8)})`;
    });
}

// Improved scroll lock functionality
const scrollLock = {
    scrollPosition: 0,
    
    enable() {
        // Store current scroll position
        this.scrollPosition = window.pageYOffset;
        
        // Apply styles to body
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.style.width = '100%';
        
        // Account for scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
    },
    
    disable() {
        // Remove styles from body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.paddingRight = '';
        
        // Restore scroll position
        window.scrollTo(0, this.scrollPosition);
    }
};

// Update toggle menu function to use new scroll lock
function toggleMenu(show) {
    const navContent = document.querySelector('.nav-content');
    const overlay = document.querySelector('.menu-overlay');
    const menuToggle = document.querySelector('.menu-toggle');
    
    navContent.classList.toggle('active', show);
    overlay.classList.toggle('active', show);
    
    const icon = menuToggle.querySelector('i');
    if (show) {
        icon.classList.replace('fa-bars', 'fa-times');
        scrollLock.enable();
    } else {
        icon.classList.replace('fa-times', 'fa-bars');
        scrollLock.disable();
    }
}

// Add smooth parallax scrolling with requestAnimationFrame
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
});

// Update event listeners
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.menu-overlay');
    
    menuToggle.addEventListener('click', () => {
        const navContent = document.querySelector('.nav-content');
        const isOpen = navContent.classList.contains('active');
        toggleMenu(!isOpen);
    });
    
    overlay.addEventListener('click', () => {
        toggleMenu(false);
    });
    
    // Initialize parallax
    updateParallax();
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
} 