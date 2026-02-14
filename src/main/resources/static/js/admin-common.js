// Admin Common JavaScript - Handles all admin panel functionality

// ============================================
// PROFILE MENU & USER SESSION
// ============================================

// Load current user information
async function loadCurrentUser() {
    try {
        const response = await fetch('/admin/api/current-user');
        if (!response.ok) {
            console.warn('User not authenticated, status:', response.status);
            // Only redirect if we get a clear 401 and we're not already on login page
            if (response.status === 401 && window.location.pathname !== '/admin/login') {
                console.log('Session expired or not authenticated, redirecting to login...');
                // Add a small delay to prevent redirect loops
                setTimeout(() => {
                    window.location.href = '/admin/login';
                }, 500);
            }
            return null;
        }

        const userData = await response.json();

        // Check if we got an error response
        if (userData.error) {
            console.warn('Error in user data:', userData.error);
            return null;
        }

        updateProfileUI(userData);
        return userData;
    } catch (error) {
        console.error('Error loading user data:', error);
        // Don't redirect on network errors - could be temporary
        // Only log the error
        return null;
    }
}

// Update UI with user data
function updateProfileUI(userData) {
    const username = userData.username || 'Admin User';
    const email = userData.email || 'admin@admin.com';
    const role = userData.role || 'Administrator';

    // Generate initials from username
    const initials = getInitials(username);

    // Update all user display elements
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');

    if (userAvatar) userAvatar.textContent = initials;
    if (userName) userName.textContent = username;
    if (userRole) userRole.textContent = role;
    if (dropdownUserName) dropdownUserName.textContent = username;
    if (dropdownUserEmail) dropdownUserEmail.textContent = email;
}

// Generate initials from name (e.g., "Diwakar Y" -> "DY")
function getInitials(name) {
    if (!name) return 'AD';

    // Remove extra whitespace and split into words
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        // Single word: take first 2 characters
        return words[0].substring(0, 2).toUpperCase();
    } else {
        // Multiple words: take first letter of first and last word
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        console.log('Dropdown toggled. Active:', dropdown.classList.contains('active'));
    } else {
        console.error('Cannot toggle - dropdown element not found');
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Clear any local storage/session storage
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to logout endpoint
            window.location.href = '/admin/logout';
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even on error
            window.location.href = '/admin/logout';
        }
    }
}

// Setup profile dropdown listeners
function setupProfileMenu() {
    const profileBtn = document.getElementById('userProfileBtn');
    const dropdown = document.getElementById('profileDropdown');

    if (!profileBtn) {
        console.warn('Profile button not found (userProfileBtn)');
        return;
    }

    if (!dropdown) {
        console.warn('Profile dropdown not found (profileDropdown)');
        return;
    }

    console.log('Setting up profile menu...');

    // Toggle on click - use direct event listener
    profileBtn.addEventListener('click', function(e) {
        console.log('Profile button clicked!');
        e.preventDefault();
        e.stopPropagation();

        const isActive = dropdown.classList.contains('active');
        console.log('Dropdown currently active:', isActive);

        if (isActive) {
            dropdown.classList.remove('active');
            console.log('Dropdown closed');
        } else {
            dropdown.classList.add('active');
            console.log('Dropdown opened');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        const clickedProfileBtn = document.getElementById('userProfileBtn');
        if (clickedProfileBtn && !clickedProfileBtn.contains(e.target)) {
            if (dropdown.classList.contains('active')) {
                console.log('Clicking outside - closing dropdown');
                dropdown.classList.remove('active');
            }
        }
    });

    // Prevent dropdown from closing when clicking inside it
    dropdown.addEventListener('click', function(e) {
        console.log('Clicked inside dropdown');
        e.stopPropagation();
    });

    console.log('Profile menu setup complete');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Add toast styles if not already added
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideInTop 0.3s ease;
                white-space: nowrap;
            }
            .toast-success { border-left: 4px solid #10b981; background-color: #f0fdf4; }
            .toast-error { border-left: 4px solid #ef4444; background-color: #fef2f2; }
            .toast i { font-size: 1.3rem; }
            .toast-success i { color: #10b981; }
            .toast-error i { color: #ef4444; }
            .toast span { font-weight: 500; color: #1f2937; }
            @keyframes slideInTop {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

// ============================================
// API FUNCTIONS
// ============================================

// Generic API call function
async function apiCall(url, method = 'GET', data = null, options = {}) {
    const { silent = false } = options || {};
    try {
        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method !== 'GET') {
            fetchOptions.body = JSON.stringify(data);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response has content
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('API Error:', error);
        if (!silent) {
            showToast('An error occurred. Please try again.', 'error');
        }
        throw error;
    }
}

// ============================================
// SIDEBAR FUNCTIONS
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebar) sidebar.classList.toggle('collapsed');
    if (mainContent) mainContent.classList.toggle('expanded');
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
}

// Close mobile sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (sidebar && mobileMenuBtn && window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            sidebar.classList.remove('mobile-open');
        }
    }
});

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = modalId ? document.getElementById(modalId) : document.querySelector('.modal.active');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal();
        }
    }
});

// ============================================
// EXPORT FUNCTION
// ============================================

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
        });
        csv += values.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Data exported successfully!', 'success');
}

// ============================================
// PAGINATION
// ============================================

function setupPagination(totalItems, itemsPerPage, currentPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');

    if (!pagination) return;

    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => currentPage > 1 && onPageChange(currentPage - 1);
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => onPageChange(i);
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 10px';
            pagination.appendChild(dots);
        }
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => currentPage < totalPages && onPageChange(currentPage + 1);
    pagination.appendChild(nextBtn);
}

// ============================================
// SEARCH & FILTER
// ============================================

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

// ============================================
// CONFIRMATION DIALOG
// ============================================

function confirmAction(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Common JS loaded');

    // Load user profile on all admin pages (except login)
    if (window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login') {

        console.log('Initializing admin page:', window.location.pathname);

        // Initialize profile menu with delay to ensure:
        // 1. DOM is fully ready
        // 2. Session is properly established (especially important after login redirect)
        setTimeout(() => {
            console.log('Loading current user...');
            loadCurrentUser().then(user => {
                if (user) {
                    console.log('User loaded successfully:', user.username);
                    setupProfileMenu();

                    // Debug: Check if elements exist
                    const profileBtn = document.getElementById('userProfileBtn');
                    const dropdown = document.getElementById('profileDropdown');
                    console.log('Profile button found:', profileBtn !== null);
                    console.log('Profile dropdown found:', dropdown !== null);
                } else {
                    console.warn('User data not loaded');
                }
            }).catch(err => {
                console.error('Failed to load user:', err);
            });
        }, 200); // Increased delay to 200ms for session stability
    }
});
