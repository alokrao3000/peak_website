// Peak NYU Dark Theme - Enhanced Interactions
document.addEventListener('DOMContentLoaded', function() {
    console.log('Peak NYU dark theme loaded');
    
    // 1. Initialize all animations
    const initAnimations = () => {
        // Add entrance animations for elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements for animation
        document.querySelectorAll('.step, .team-member, .feature-badge, .stat').forEach(el => {
            observer.observe(el);
        });
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .step, .team-member, .feature-badge, .stat {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .step:nth-child(1) { transition-delay: 0.1s; }
            .step:nth-child(2) { transition-delay: 0.2s; }
            .step:nth-child(3) { transition-delay: 0.3s; }
            
            .team-member:nth-child(1) { transition-delay: 0.1s; }
            .team-member:nth-child(2) { transition-delay: 0.2s; }
            .team-member:nth-child(3) { transition-delay: 0.3s; }
            .team-member:nth-child(4) { transition-delay: 0.4s; }
        `;
        document.head.appendChild(style);
    };
    
    // 2. Enhanced hover effects
    const enhanceHoverEffects = () => {
        // Feature badges
        document.querySelectorAll('.feature-badge').forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(5deg)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            badge.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0)';
                }
            });
        });
        
        // Team members
        document.querySelectorAll('.team-member').forEach(member => {
            member.addEventListener('mouseenter', function() {
                const photo = this.querySelector('.member-photo');
                const glow = this.querySelector('.photo-glow');
                if (photo && glow) {
                    photo.style.transform = 'scale(1.1)';
                    glow.style.opacity = '1';
                }
            });
            
            member.addEventListener('mouseleave', function() {
                const photo = this.querySelector('.member-photo');
                const glow = this.querySelector('.photo-glow');
                if (photo && glow) {
                    photo.style.transform = 'scale(1)';
                    glow.style.opacity = '0.5';
                }
            });
        });
        
        // App Store buttons
        document.querySelectorAll('.app-store-button, .footer-app-button').forEach(button => {
            button.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'translateY(-3px) scale(1.1)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            button.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    };
    
    // 3. Stats counter animation
    const animateStats = () => {
        const stats = document.querySelectorAll('.stat-number, .story-stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseInt(target.textContent);
                    const duration = 2000;
                    const startTime = Date.now();
                    
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const currentValue = Math.floor(progress * finalValue);
                        
                        target.textContent = currentValue.toLocaleString() + 
                            (target.classList.contains('stat-number') ? '+' : 
                             target.classList.contains('story-stat-number') && !isNaN(finalValue) ? (target.textContent.includes('%') ? '%' : '') : '');
                        
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    
                    animate();
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    };
    
    // 4. Background pulse enhancement
    const enhanceBackground = () => {
        const pulses = document.querySelectorAll('.bg-pulse-1, .bg-pulse-2, .bg-pulse-3');
        
        pulses.forEach((pulse, index) => {
            // Add random variation to animations
            const delay = index * 0.5;
            const duration = 8 + (index * 2);
            
            pulse.style.animationDelay = `${delay}s`;
            pulse.style.animationDuration = `${duration}s`;
        });
        
        // Add mouse interaction to background
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            document.querySelectorAll('.bg-pulse-1, .bg-pulse-2, .bg-pulse-3').forEach(pulse => {
                pulse.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
            });
        });
    };
    
    // 5. Smooth scrolling
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    
    // 6. Theme toggle functionality (placeholder for future light/dark toggle)
    const initThemeToggle = () => {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (icon.classList.contains('fa-moon')) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                    // Future light theme would go here
                    console.log('Switching to light theme (not implemented)');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                    // We're already in dark theme
                }
                
                // Add click animation
                this.style.transform = 'rotate(180deg) scale(1.1)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 300);
            });
        }
    };
    
    // 7. Parallax effect for hero
    const initParallax = () => {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            const speed = 0.5;
            
            if (hero) {
                hero.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
    };
    
    // 8. Initialize everything
    const init = () => {
        initAnimations();
        enhanceHoverEffects();
        animateStats();
        enhanceBackground();
        initSmoothScroll();
        initThemeToggle();
        initParallax();
        
        // Add loaded class for transitions
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
        
        console.log('Dark theme initialized successfully');
    };
    
    // Start initialization
    init();
    
    // Add CSS for loaded state
    const loadedStyle = document.createElement('style');
    loadedStyle.textContent = `
        body {
            opacity: 0;
            transition: opacity 0.8s ease;
        }
        
        body.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(loadedStyle);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // 'D' to toggle theme (future functionality)
    if (e.key === 'd' || e.key === 'D') {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) toggle.click();
    }
    
    // Space to scroll to app download
    if (e.key === ' ') {
        e.preventDefault();
        const button = document.querySelector('.app-store-button');
        if (button) {
            button.scrollIntoView({ behavior: 'smooth' });
        }
    }
});