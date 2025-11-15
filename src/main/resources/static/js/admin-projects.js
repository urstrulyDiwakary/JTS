// Projects Management JavaScript

let projects = [];
let filteredProjects = [];
let currentPage = 1;
const projectsPerPage = 6;
let currentEditId = null;
let currentView = 'grid'; // 'grid' or 'list'

// ============================================
// LOAD PROJECTS
// ============================================

async function loadProjects() {
    try {
        projects = await apiCall('/api/admin/projects');
        filteredProjects = [...projects];
        updateStats();
        renderProjects();
        showToast('Projects loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Failed to load projects', 'error');
    }
}

// ============================================
// UPDATE STATS
// ============================================

function updateStats() {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
    const pendingProjects = projects.filter(p => p.status === 'PENDING').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

    const statBoxes = document.querySelectorAll('.stat-box h3');
    if (statBoxes.length >= 4) {
        statBoxes[0].textContent = totalProjects;
        statBoxes[1].textContent = activeProjects;
        statBoxes[2].textContent = pendingProjects;
        statBoxes[3].textContent = completedProjects;
    }
}

// ============================================
// RENDER PROJECTS
// ============================================

function renderProjects() {
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    if (paginatedProjects.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">No projects found</div>';
        return;
    }

    grid.innerHTML = paginatedProjects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-image">
                ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.name}" style="width:100%;height:100%;object-fit:cover;">` :
                  `<div style="width:100%;height:100%;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:bold;">${project.name.charAt(0)}</div>`}
            </div>
            <div class="project-body">
                <span class="project-status status-${getStatusClass(project.status)}">${project.status || 'Pending'}</span>
                <h3>${project.name}</h3>
                <p>${project.description || 'No description available'}</p>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${project.clientName || 'Unknown Client'}</span>
                    </div>
                </div>
            </div>
            <div class="project-footer">
                <button class="card-btn view" onclick="viewProject(${project.id})"><i class="fas fa-eye"></i></button>
                <button class="card-btn edit" onclick="editProject(${project.id})"><i class="fas fa-edit"></i></button>
                <button class="card-btn delete" onclick="deleteProject(${project.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    // Apply the current view mode after re-rendering
    console.log('Current view mode:', currentView);
    console.log('Grid has list-view class before:', grid.classList.contains('list-view'));

    if (currentView === 'list') {
        grid.classList.add('list-view');
        console.log('Added list-view class');
    } else {
        grid.classList.remove('list-view');
        console.log('Removed list-view class');
    }

    console.log('Grid has list-view class after:', grid.classList.contains('list-view'));
    console.log('Grid classes:', grid.className);

    // Setup pagination
    setupPagination(filteredProjects.length, projectsPerPage, currentPage, (page) => {
        currentPage = page;
        renderProjects();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function getStatusClass(status) {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'in_progress') return 'active';
    if (statusLower === 'completed') return 'completed';
    if (statusLower === 'pending') return 'pending';
    return 'on-hold';
}

// ============================================
// PROJECT ACTIONS
// ============================================

function openAddProjectModal() {
    currentEditId = null;
    const modal = document.getElementById('projectModal');
    if (!modal) {
        console.error('Project modal not found');
        return;
    }

    const form = modal.querySelector('form');
    if (!form) {
        console.error('Form not found in modal');
        return;
    }

    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Project';
    }

    form.reset();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Create Project';
    }

    openModal('projectModal');
}

// Make it available globally
window.openProjectModal = openAddProjectModal;
window.openAddProjectModal = openAddProjectModal;

function viewProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) {
        showToast('Project not found', 'error');
        return;
    }

    // Create and show project details modal
    showProjectDetailsModal(project);
}

function showProjectDetailsModal(project) {
    // Remove existing modal if present
    const existingModal = document.getElementById('projectDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div class="modal active" id="projectDetailsModal" onclick="if(event.target === this) closeModal('projectDetailsModal')">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2><i class="fas fa-eye"></i> Project Details</h2>
                    <button class="close-btn" onclick="closeModal('projectDetailsModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    ${project.imageUrl ? `
                        <div style="width: 100%; height: 300px; margin-bottom: 20px; border-radius: 8px; overflow: hidden;">
                            <img src="${project.imageUrl}" alt="${project.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    ` : `
                        <div style="width: 100%; height: 200px; margin-bottom: 20px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 4rem; color: white; font-weight: bold;">${project.name.charAt(0)}</span>
                        </div>
                    `}

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">PROJECT NAME</label>
                            <p style="font-size: 1.1rem; font-weight: 600; color: var(--text-dark);">${project.name}</p>
                        </div>
                        <div>
                            <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">CLIENT NAME</label>
                            <p style="font-size: 1rem; color: var(--text-dark);">${project.clientName || 'Not specified'}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">STATUS</label>
                        <span class="project-status status-${getStatusClass(project.status)}" style="font-size: 0.9rem;">
                            ${project.status || 'Pending'}
                        </span>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">DESCRIPTION</label>
                        <p style="color: #374151; line-height: 1.6;">${project.description || 'No description available'}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; background: var(--light-bg); border-radius: 8px;">
                        <div>
                            <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">PROJECT ID</label>
                            <p style="color: var(--text-dark); font-family: monospace;">#${project.id}</p>
                        </div>
                        <div>
                            <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">IMAGE URL</label>
                            <p style="color: var(--text-dark); font-size: 0.85rem; word-break: break-all;">${project.imageUrl || 'No image'}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; padding: 20px; border-top: 1px solid var(--border-color);">
                    <button class="btn btn-secondary" onclick="closeModal('projectDetailsModal')">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <button class="btn btn-primary" onclick="closeModal('projectDetailsModal'); editProject(${project.id});">
                        <i class="fas fa-edit"></i> Edit Project
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) {
        showToast('Project not found', 'error');
        return;
    }

    currentEditId = id;
    const modal = document.getElementById('projectModal');
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
        modalTitle.textContent = 'Edit Project';
    }

    // Fill form with project data using name attributes
    const nameInput = form.querySelector('input[name="name"]');
    const clientNameInput = form.querySelector('input[name="clientName"]');
    const descriptionInput = form.querySelector('textarea[name="description"]');
    const imageUrlInput = form.querySelector('input[name="imageUrl"]');
    const statusSelect = form.querySelector('select[name="status"]');

    if (nameInput) nameInput.value = project.name || '';
    if (clientNameInput) clientNameInput.value = project.clientName || '';
    if (descriptionInput) descriptionInput.value = project.description || '';
    if (imageUrlInput) imageUrlInput.value = project.imageUrl || '';

    // Set status select
    if (statusSelect) {
        Array.from(statusSelect.options).forEach(option => {
            if (option.value.toUpperCase() === (project.status || 'PENDING').toUpperCase()) {
                option.selected = true;
            }
        });
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Update Project';
    }

    openModal('projectModal');
}

async function deleteProject(id) {
    confirmAction('Are you sure you want to delete this project?', async () => {
        try {
            await apiCall(`/api/admin/projects/delete/${id}`, 'DELETE');
            projects = projects.filter(p => p.id !== id);
            filteredProjects = filteredProjects.filter(p => p.id !== id);
            updateStats();
            renderProjects();
            showToast('Project deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast('Failed to delete project', 'error');
        }
    });
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleProjectSubmit(event) {
    event.preventDefault();

    const form = event.target;

    // Get form data using name attributes
    const nameInput = form.querySelector('input[name="name"]');
    const clientNameInput = form.querySelector('input[name="clientName"]');
    const descriptionInput = form.querySelector('textarea[name="description"]');
    const imageUrlInput = form.querySelector('input[name="imageUrl"]');
    const statusSelect = form.querySelector('select[name="status"]');

    if (!nameInput || !clientNameInput || !statusSelect) {
        showToast('Form fields not found. Please refresh the page.', 'error');
        return;
    }

    const formData = {
        name: nameInput.value.trim(),
        clientName: clientNameInput.value.trim(),
        description: descriptionInput ? descriptionInput.value.trim() : '',
        imageUrl: imageUrlInput ? imageUrlInput.value.trim() : '',
        status: statusSelect.value.toUpperCase()
    };

    // Validate required fields
    if (!formData.name || !formData.clientName || !formData.status) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        if (currentEditId) {
            // Update existing project
            const updatedProject = await apiCall(`/api/admin/projects/${currentEditId}`, 'PUT', formData);
            const index = projects.findIndex(p => p.id === currentEditId);
            if (index !== -1) {
                projects[index] = updatedProject;
            }
            showToast('Project updated successfully', 'success');
        } else {
            // Create new project
            const newProject = await apiCall('/api/admin/projects/create', 'POST', formData);
            projects.push(newProject);
            showToast('Project created successfully', 'success');
        }

        filteredProjects = [...projects];
        updateStats();
        renderProjects();
        closeModal('projectModal');
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Failed to save project. Please try again.', 'error');
    }
}

// ============================================
// VIEW TOGGLE (GRID/LIST)
// ============================================

function setupViewToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const projectsGrid = document.querySelector('.projects-grid');

    console.log('setupViewToggle called');
    console.log('Found toggle buttons:', toggleButtons.length);
    console.log('Initial currentView:', currentView);

    toggleButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            console.log('Toggle button clicked, index:', index);

            // Remove active class from all buttons
            toggleButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Switch view
            if (index === 0) {
                // Grid View
                console.log('Switching to GRID view');
                currentView = 'grid';
                if (projectsGrid) {
                    projectsGrid.classList.remove('list-view');
                    console.log('Removed list-view class from grid');
                }
            } else {
                // List View
                console.log('Switching to LIST view');
                currentView = 'list';
                if (projectsGrid) {
                    projectsGrid.classList.add('list-view');
                    console.log('Added list-view class to grid');
                }
            }

            console.log('currentView is now:', currentView);
            console.log('Grid classes:', projectsGrid?.className);
        });
    });

    // Initialize view state on page load - ensure buttons match currentView
    console.log('Initializing view state, currentView:', currentView);
    if (currentView === 'list' && projectsGrid) {
        projectsGrid.classList.add('list-view');
        if (toggleButtons[1]) {
            toggleButtons.forEach(b => b.classList.remove('active'));
            toggleButtons[1].classList.add('active');
        }
        console.log('Initialized as list view');
    } else {
        projectsGrid?.classList.remove('list-view');
        if (toggleButtons[0]) {
            toggleButtons.forEach(b => b.classList.remove('active'));
            toggleButtons[0].classList.add('active');
        }
        console.log('Initialized as grid view');
    }
}

// ============================================
// SEARCH & FILTER
// ============================================

function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        // Add focus/blur styling
        searchInput.addEventListener('focus', () => {
            const searchBar = document.querySelector('.search-bar');
            if (searchBar) {
                searchBar.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }
        });

        searchInput.addEventListener('blur', () => {
            const searchBar = document.querySelector('.search-bar');
            if (searchBar) {
                searchBar.style.boxShadow = '';
            }
        });

        // Add search functionality
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                filteredProjects = [...projects];
            } else {
                filteredProjects = projects.filter(project =>
                    project.name.toLowerCase().includes(query) ||
                    (project.description && project.description.toLowerCase().includes(query)) ||
                    (project.clientName && project.clientName.toLowerCase().includes(query))
                );
            }

            currentPage = 1;
            renderProjects();

            if (query !== '' && filteredProjects.length === 0) {
                showToast('No projects found matching your search', 'error');
            }
        }, 300));
    }
}

function setupFilters() {
    // Setup the status filter dropdown
    const statusFilterDropdown = document.getElementById('statusFilterDropdown');
    if (statusFilterDropdown) {
        statusFilterDropdown.addEventListener('change', (e) => {
            const statusValue = e.target.value;

            if (!statusValue || statusValue === '') {
                // Show all projects
                filteredProjects = [...projects];
            } else {
                // Filter by status
                filteredProjects = projects.filter(project => {
                    const projectStatus = (project.status || '').toUpperCase();
                    return projectStatus === statusValue.toUpperCase();
                });
            }

            currentPage = 1;
            renderProjects();
            showToast(`Filtered by: ${statusValue || 'All Projects'}`, 'success');
        });
    }
}

// ============================================
// EXPORT
// ============================================

function exportProjects() {
    if (projects.length === 0) {
        showToast('No projects to export', 'error');
        return;
    }
    exportToCSV(projects, 'projects');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Projects page initializing...');

    // Load projects from API
    loadProjects();

    // Setup search
    setupSearch();

    // Setup filters
    setupFilters();

    // Setup view toggle
    setupViewToggle();

    // Setup form submission
    const form = document.querySelector('#projectModal form');
    if (form) {
        form.addEventListener('submit', handleProjectSubmit);
    } else {
        console.warn('Project form not found');
    }

    // Setup export button if exists
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Export')) {
            btn.onclick = exportProjects;
            console.log('Export button configured');
        }
    });

    console.log('Projects page initialized');
});


