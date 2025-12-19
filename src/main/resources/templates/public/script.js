// =============================================
// JESTA TECH SOLUTIONS - MAIN JAVASCRIPT FILE
// =============================================

// === GLOBAL VARIABLES ===
let currentTestimonial = 1;
let testimonialInterval;

// === DOM CONTENT LOADED EVENT ===
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeSideMenu();
    initializeTestimonialCarousel();
    initializeScrollAnimations();
    initializeCounters();
    initializePortfolioFilters();
    initializeFAQ();
    initializeContactForm();
    initializeSmoothScroll();
    highlightActiveNav();
    
    // Start testimonial auto-rotation
    startTestimonialAutoRotation();
});

// === SIDE MENU FUNCTIONALITY ===
function initializeSideMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
    const sideMenuOverlay = document.getElementById('sideMenuOverlay');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            openSideMenu();
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', closeSideMenu);
    }
    
    if (sideMenuOverlay) {
        sideMenuOverlay.addEventListener('click', closeSideMenu);
    }
}

function openSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const sideMenuOverlay = document.getElementById('sideMenuOverlay');
    
    if (sideMenu) {
        sideMenu.classList.add('active');
    }
    
    if (sideMenuOverlay) {
        sideMenuOverlay.classList.add('active');
    }
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
}

function closeSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const sideMenuOverlay = document.getElementById('sideMenuOverlay');
    
    if (sideMenu) {
        sideMenu.classList.remove('active');
    }
    
    if (sideMenuOverlay) {
        sideMenuOverlay.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// === TESTIMONIALS CAROUSEL ===
function initializeTestimonialCarousel() {
    // Manual dot click navigation
    const dots = document.querySelectorAll('.carousel-dots .dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showTestimonial(index + 1);
            // Reset auto-rotation timer
            resetTestimonialAutoRotation();
        });
    });
}

function showTestimonial(n) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!testimonials.length) return;
    
    if (n > testimonials.length) {
        currentTestimonial = 1;
    }
    if (n < 1) {
        currentTestimonial = testimonials.length;
    }
    
    // Hide all testimonials
    testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
    });
    
    // Remove active class from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current testimonial
    if (testimonials[currentTestimonial - 1]) {
        testimonials[currentTestimonial - 1].classList.add('active');
    }
    
    // Activate current dot
    if (dots[currentTestimonial - 1]) {
        dots[currentTestimonial - 1].classList.add('active');
    }
}

// Global function for dot clicks
function currentSlide(n) {
    showTestimonial(n);
    currentTestimonial = n;
    resetTestimonialAutoRotation();
}

function startTestimonialAutoRotation() {
    testimonialInterval = setInterval(function() {
        currentTestimonial++;
        showTestimonial(currentTestimonial);
    }, 5000); // Change every 5 seconds
}

function resetTestimonialAutoRotation() {
    clearInterval(testimonialInterval);
    startTestimonialAutoRotation();
}

// === SCROLL ANIMATIONS ===
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade-in-scroll class
    const animatedElements = document.querySelectorAll('.fade-in-scroll');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// === COUNTER ANIMATION ===
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // Animation speed
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const counter = entry.target;
                animateCounter(counter, speed);
                counter.classList.add('counted');
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(counter, speed) {
    const target = parseInt(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '+';
    const increment = target / speed;
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        
        if (current < target) {
            counter.textContent = Math.ceil(current) + suffix;
            setTimeout(updateCounter, 1);
        } else {
            counter.textContent = target + suffix;
        }
    };
    
    updateCounter();
}

// === PORTFOLIO FILTERS ===
function initializePortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (!filterButtons.length || !portfolioItems.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                if (filter === 'all') {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    const categories = item.getAttribute('data-category').split(' ');
                    if (categories.includes(filter)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(30px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
}

// === FAQ ACCORDION ===
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (!faqQuestions.length) return;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// === CONTACT FORM HANDLING ===
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value;
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            showFormMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Simulate form submission
        // In production, replace this with actual form submission to server
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(function() {
            showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Hide success message after 5 seconds
            setTimeout(function() {
                hideFormMessage();
            }, 5000);
        }, 2000);
    });
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    formMessage.style.display = 'block';
}

function hideFormMessage() {
    const formMessage = document.getElementById('formMessage');
    
    if (!formMessage) return;
    
    formMessage.style.display = 'none';
}

// === SMOOTH SCROLL ===
function initializeSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignore empty anchors and javascript:void(0)
            if (href === '#' || href === '#0' || href.includes('javascript')) {
                return;
            }
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// === HIGHLIGHT ACTIVE NAVIGATION ===
function highlightActiveNav() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update desktop navigation
    const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
    desktopNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update mobile bottom navigation
    const mobileNavLinks = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    mobileNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update side menu navigation
    const sideMenuLinks = document.querySelectorAll('.side-menu-links a');
    sideMenuLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// === SCROLL TO TOP BUTTON (Optional Enhancement) ===
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// === HEADER SCROLL EFFECT ===
function initializeHeaderScroll() {
    const header = document.querySelector('.desktop-header');
    
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

// === LAZY LOADING FOR IMAGES (Optional Enhancement) ===
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// === UTILITY FUNCTIONS ===

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// === CONSOLE LOG (Development Only) ===
console.log('%c Jesta Tech Solutions ', 'background: #0D6EFD; color: white; font-size: 16px; padding: 10px;');
console.log('%c Website Loaded Successfully! ', 'background: #28a745; color: white; font-size: 14px; padding: 5px;');

// === HANDLE WINDOW RESIZE ===
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Re-initialize certain features on resize if needed
        highlightActiveNav();
    }, 250);
});

// === PREVENT EMPTY LINK CLICKS ===
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
        e.preventDefault();
    }
});

// === ACCESSIBILITY ENHANCEMENTS ===
// Add focus visible class for keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
});

// === SERVICE WORKER REGISTRATION (Progressive Web App - Optional) ===
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//         navigator.serviceWorker.register('/sw.js')
//             .then(function(registration) {
//                 console.log('ServiceWorker registration successful');
//             })
//             .catch(function(err) {
//                 console.log('ServiceWorker registration failed: ', err);
//             });
//     });
// }
