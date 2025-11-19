/**
 * ADMIN MOBILE NAVIGATION JAVASCRIPT
 * Handles active state synchronization between desktop sidebar and mobile bottom nav
 * Automatically sets the active navigation item based on current page URL
 */

(function() {
    'use strict';

    /**
     * Initialize navigation active states on page load
     */
    function initNavigation() {
        const currentPath = window.location.pathname;

        // Update both sidebar and bottom nav active states
        updateActiveNavLinks(currentPath);
    }

    /**
     * Update active state for both desktop sidebar and mobile bottom nav
     * @param {string} currentPath - The current page path
     */
    function updateActiveNavLinks(currentPath) {
        // Remove active class from all nav links (both sidebar and bottom nav)
        const allNavLinks = document.querySelectorAll('.nav-link, .bottom-nav-link');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to matching links
        allNavLinks.forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;

            // Check if the link matches the current path
            if (linkPath === currentPath ||
                (currentPath.includes(linkPath) && linkPath !== '/admin' && linkPath !== '/admin/')) {
                link.classList.add('active');
            }
        });

        // Special case: if we're at /admin or /admin/dashboard, activate dashboard
        if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard') {
            const dashboardLinks = document.querySelectorAll('a[href="/admin/dashboard"]');
            dashboardLinks.forEach(link => {
                link.classList.add('active');
            });
        }
    }

    /**
     * Add click event listeners to bottom nav links for immediate feedback
     */
    function addClickListeners() {
        const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');

        bottomNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Remove active from all bottom nav links
                bottomNavLinks.forEach(l => l.classList.remove('active'));

                // Add active to clicked link
                this.classList.add('active');

                // Optional: Add a visual ripple effect
                createRipple(e, this);
            });
        });
    }

    /**
     * Create a ripple effect on click for better UX
     * @param {Event} event - The click event
     * @param {HTMLElement} element - The clicked element
     */
    function createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');

        // Add ripple styles if not already added
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .ripple-effect {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ripple-animation 0.6s ease-out;
                    pointer-events: none;
                }
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                .bottom-nav-link {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }

        element.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Handle window resize to ensure proper layout
     */
    function handleResize() {
        // Re-check if we need to adjust any layouts
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Ensure main content has proper padding
            const mainContent = document.querySelector('.main-content');
            if (mainContent && !mainContent.style.paddingBottom) {
                mainContent.style.paddingBottom = '80px';
            }
        }
    }

    /**
     * Debounce function to limit resize event firing
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     */
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initNavigation();
            addClickListeners();
            window.addEventListener('resize', debounce(handleResize, 250));
        });
    } else {
        initNavigation();
        addClickListeners();
        window.addEventListener('resize', debounce(handleResize, 250));
    }

    // Re-initialize on page show (for browser back/forward button)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            initNavigation();
        }
    });

})();

