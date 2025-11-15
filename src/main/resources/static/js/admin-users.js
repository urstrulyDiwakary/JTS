// Users Management JavaScript

let users = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 6;
let currentEditId = null;

// ============================================
// LOAD USERS
// ============================================

async function loadUsers() {
    try {
        users = await apiCall('/api/admin/users');
        filteredUsers = [...users];
        renderUsers();
        showToast('Users loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading users:', error);
        // If API fails, keep showing static HTML users
    }
}

// ============================================
// RENDER USERS
// ============================================

function renderUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const grid = document.querySelector('.users-grid');
    if (!grid) return;

    if (paginatedUsers.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">No users found</div>';
        return;
    }

    grid.innerHTML = paginatedUsers.map(user => `
        <div class="user-card" data-user-id="${user.id}">
            <span class="status-badge ${user.role === 'ADMIN' ? 'active' : 'inactive'}">${user.role || 'USER'}</span>
            <div class="user-card-header">
                <div class="user-image">${getInitials(user.username)}</div>
                <div class="user-info">
                    <h3>${user.username}</h3>
                    <p>${user.role || 'User'}</p>
                </div>
            </div>
            <div class="user-card-body">
                <div class="user-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${user.email}</span>
                </div>
                <div class="user-detail">
                    <i class="fas fa-calendar"></i>
                    <span>ID: ${user.id}</span>
                </div>
            </div>
            <div class="user-card-footer">
                <button class="card-btn view" onclick="viewUser(${user.id})"><i class="fas fa-eye"></i> View</button>
                <button class="card-btn edit" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="card-btn delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    // Setup pagination
    setupPagination(filteredUsers.length, usersPerPage, currentPage, (page) => {
        currentPage = page;
        renderUsers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// USER ACTIONS
// ============================================

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function openAddUserModal() {
    currentEditId = null;
    const modal = document.getElementById('userModal');
    if (!modal) {
        console.error('User modal not found');
        return;
    }

    const form = modal.querySelector('form');
    if (!form) {
        console.error('Form not found in modal');
        return;
    }

    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Add New User';
    }

    form.reset();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Add User';
    }

    openModal('userModal');
}

function viewUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    alert(`User Details:\n\nID: ${user.id}\nUsername: ${user.username}\nEmail: ${user.email}\nRole: ${user.role || 'USER'}`);
}

async function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    currentEditId = id;
    const modal = document.getElementById('userModal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }

    const form = modal.querySelector('form');
    if (!form) {
        console.error('Form not found');
        return;
    }

    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Edit User';
    }

    // Fill form with user data using name attributes
    const usernameInput = form.querySelector('input[name="username"]') || form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[name="email"]') || form.querySelector('input[type="email"]');
    const roleSelect = form.querySelector('select[name="role"]') || form.querySelector('select');

    if (usernameInput) usernameInput.value = user.username || '';
    if (emailInput) emailInput.value = user.email || '';

    // Set role select
    if (roleSelect) {
        Array.from(roleSelect.options).forEach(option => {
            if (option.value.toUpperCase() === (user.role || 'USER').toUpperCase()) {
                option.selected = true;
            }
        });
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Update User';
    }

    openModal('userModal');
}

async function deleteUser(id) {
    confirmAction('Are you sure you want to delete this user?', async () => {
        try {
            await apiCall(`/api/admin/users/delete/${id}`, 'DELETE');
            users = users.filter(u => u.id !== id);
            filteredUsers = filteredUsers.filter(u => u.id !== id);
            renderUsers();
            showToast('User deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    });
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleUserSubmit(event) {
    event.preventDefault();

    const form = event.target;

    // Get form data using name attributes (more reliable)
    const usernameInput = form.querySelector('input[name="username"]') || form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[name="email"]') || form.querySelector('input[type="email"]');
    const roleSelect = form.querySelector('select[name="role"]') || form.querySelector('select');

    if (!usernameInput || !emailInput || !roleSelect) {
        showToast('Form fields not found. Please refresh the page.', 'error');
        console.error('Form fields missing:', { usernameInput, emailInput, roleSelect });
        return;
    }

    const formData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        password: 'defaultPassword123', // Default password for new users
        role: roleSelect.value.toUpperCase()
    };

    // Validate data
    if (!formData.username || !formData.email || !formData.role) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        if (currentEditId) {
            // Update existing user
            const updatedUser = await apiCall(`/api/admin/users/${currentEditId}`, 'PUT', formData);
            const index = users.findIndex(u => u.id === currentEditId);
            if (index !== -1) {
                users[index] = updatedUser;
            }
            showToast('User updated successfully', 'success');
        } else {
            // Create new user
            const newUser = await apiCall('/api/admin/users/create', 'POST', formData);
            users.push(newUser);
            showToast('User created successfully', 'success');
        }

        filteredUsers = [...users];
        renderUsers();
        closeModal('userModal');
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('Failed to save user. Please try again.', 'error');
    }
}

// ============================================
// SEARCH & FILTER
// ============================================

function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase();
            filteredUsers = users.filter(user =>
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
            currentPage = 1;
            renderUsers();
        }, 300));
    }
}

function setupFilters() {
    const filters = document.querySelectorAll('.filter-group select');
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            applyFilters();
        });
    });
}

function applyFilters() {
    const roleFilter = document.querySelector('.filter-group select:nth-of-type(2)')?.value;

    filteredUsers = users.filter(user => {
        if (roleFilter && roleFilter !== 'All Roles') {
            if (user.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
        }
        return true;
    });

    currentPage = 1;
    renderUsers();
}

// ============================================
// EXPORT
// ============================================

function exportUsers() {
    exportToCSV(users, 'users');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Users page initializing...');

    // Load users from API
    loadUsers();

    // Setup search
    setupSearch();

    // Setup filters
    setupFilters();

    // Setup form submission
    const form = document.querySelector('#userModal form');
    if (form) {
        form.addEventListener('submit', handleUserSubmit);
    } else {
        console.warn('User form not found');
    }

    // Setup export button - find button with "Export" text
    const buttons = document.querySelectorAll('.btn-secondary');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Export')) {
            btn.onclick = exportUsers;
            console.log('Export button configured');
        }
    });

    console.log('Users page initialized');
});

