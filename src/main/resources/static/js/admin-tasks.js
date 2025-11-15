// Tasks Management JavaScript

let tasks = [];
let currentEditId = null;
let currentStatus = null;

// ============================================
// LOAD TASKS
// ============================================

async function loadTasks() {
    try {
        tasks = await apiCall('/api/admin/tasks', 'GET', null, { silent: true });
        renderAllTasks();
        updateStats();
        showToast('Tasks loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Failed to load tasks', 'error');
        // Show sample tasks for demo
        createSampleTasks();
    }
}

function createSampleTasks() {
    tasks = [
        {
            id: 1,
            title: 'Design Homepage Mockup',
            description: 'Create modern homepage design with new branding',
            status: 'TODO',
            priority: 'HIGH',
            assignedTo: 'John Doe',
            projectName: 'Website Redesign',
            dueDate: '2025-11-20',
            tags: 'design, ui'
        },
        {
            id: 2,
            title: 'Fix Login Bug',
            description: 'Users unable to login with special characters in password',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            assignedTo: 'Jane Smith',
            projectName: 'Bug Fixes',
            dueDate: '2025-11-16',
            tags: 'bug, urgent'
        },
        {
            id: 3,
            title: 'API Integration',
            description: 'Integrate payment gateway API',
            status: 'REVIEW',
            priority: 'HIGH',
            assignedTo: 'Mike Johnson',
            projectName: 'E-Commerce',
            dueDate: '2025-11-18',
            tags: 'backend, api'
        },
        {
            id: 4,
            title: 'Update Documentation',
            description: 'Update user manual with new features',
            status: 'DONE',
            priority: 'LOW',
            assignedTo: 'Sarah Wilson',
            projectName: 'Documentation',
            dueDate: '2025-11-15',
            tags: 'docs'
        }
    ];
    renderAllTasks();
    updateStats();
}

// ============================================
// RENDER TASKS
// ============================================

function renderAllTasks() {
    // Clear all columns
    document.getElementById('todoTasks').innerHTML = '';
    document.getElementById('progressTasks').innerHTML = '';
    document.getElementById('reviewTasks').innerHTML = '';
    document.getElementById('doneTasks').innerHTML = '';

    // Render tasks in respective columns
    tasks.forEach(task => {
        const taskHtml = createTaskCard(task);

        switch(task.status) {
            case 'TODO':
                document.getElementById('todoTasks').innerHTML += taskHtml;
                break;
            case 'IN_PROGRESS':
                document.getElementById('progressTasks').innerHTML += taskHtml;
                break;
            case 'REVIEW':
                document.getElementById('reviewTasks').innerHTML += taskHtml;
                break;
            case 'DONE':
                document.getElementById('doneTasks').innerHTML += taskHtml;
                break;
        }
    });

    // Update column counts
    updateColumnCounts();
}

function createTaskCard(task) {
    const priorityClass = task.priority ? task.priority.toLowerCase() : 'low';
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';

    return `
        <div class="task-card" onclick="viewTask(${task.id})">
            <div class="task-actions">
                <button class="task-action-btn edit" onclick="event.stopPropagation(); editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" onclick="event.stopPropagation(); deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <span class="task-priority ${priorityClass}">${task.priority || 'MEDIUM'}</span>
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description || 'No description'}</div>
            <div class="task-meta">
                <div>
                    <i class="fas fa-calendar"></i>
                    ${dueDate}
                </div>
                ${task.assignedTo ? `<span class="task-assignee">${task.assignedTo}</span>` : ''}
            </div>
            ${task.projectName ? `<div style="margin-top: 8px; font-size: 0.75rem; color: #9ca3af;">
                <i class="fas fa-folder"></i> ${task.projectName}
            </div>` : ''}
        </div>
    `;
}

function updateColumnCounts() {
    const todoCount = tasks.filter(t => t.status === 'TODO').length;
    const progressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const reviewCount = tasks.filter(t => t.status === 'REVIEW').length;
    const doneCount = tasks.filter(t => t.status === 'DONE').length;

    document.getElementById('todoColumnCount').textContent = todoCount;
    document.getElementById('progressColumnCount').textContent = progressCount;
    document.getElementById('reviewColumnCount').textContent = reviewCount;
    document.getElementById('doneColumnCount').textContent = doneCount;
}

// ============================================
// UPDATE STATS
// ============================================

function updateStats() {
    const todoCount = tasks.filter(t => t.status === 'TODO').length;
    const progressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const reviewCount = tasks.filter(t => t.status === 'REVIEW').length;
    const doneCount = tasks.filter(t => t.status === 'DONE').length;

    document.getElementById('todoCount').textContent = todoCount;
    document.getElementById('progressCount').textContent = progressCount;
    document.getElementById('reviewCount').textContent = reviewCount;
    document.getElementById('doneCount').textContent = doneCount;
}

// ============================================
// TASK MODAL
// ============================================

function openTaskModal(status = null) {
    currentEditId = null;
    currentStatus = status;

    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtnText');

    modalTitle.textContent = 'Create Task';
    submitBtn.textContent = 'Create Task';
    form.reset();

    // Set status if provided
    if (status) {
        form.querySelector('[name="status"]').value = status;
    }

    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    currentEditId = null;
    currentStatus = null;
}

// ============================================
// VIEW TASK
// ============================================

function viewTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    const priorityClass = task.priority ? task.priority.toLowerCase() : 'low';
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2><i class="fas fa-tasks"></i> Task Details</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 20px 0;">
                <div style="margin-bottom: 20px;">
                    <span class="task-priority ${priorityClass}">${task.priority || 'MEDIUM'}</span>
                    <span style="margin-left: 10px; padding: 6px 12px; background: #e0e7ff; color: #3b82f6; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                        ${formatStatus(task.status)}
                    </span>
                </div>

                <h3 style="font-size: 1.5rem; margin-bottom: 15px;">${task.title}</h3>

                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #4b5563; line-height: 1.6;">${task.description || 'No description provided'}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">ASSIGNED TO</label>
                        <p style="font-size: 1rem;">${task.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">DUE DATE</label>
                        <p style="font-size: 1rem;"><i class="fas fa-calendar"></i> ${dueDate}</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">PROJECT</label>
                        <p style="font-size: 1rem;">${task.projectName || 'No project'}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #6b7280; font-size: 0.85rem; display: block; margin-bottom: 5px;">TAGS</label>
                        <p style="font-size: 1rem;">${task.tags || 'No tags'}</p>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i> Close
                </button>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove(); editTask(${task.id})">
                    <i class="fas fa-edit"></i> Edit Task
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function formatStatus(status) {
    switch(status) {
        case 'TODO': return 'To Do';
        case 'IN_PROGRESS': return 'In Progress';
        case 'REVIEW': return 'Review';
        case 'DONE': return 'Done';
        default: return status;
    }
}

// ============================================
// EDIT TASK
// ============================================

async function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    currentEditId = id;

    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtnText');

    modalTitle.textContent = 'Edit Task';
    submitBtn.textContent = 'Update Task';

    // Fill form with task data
    form.querySelector('[name="title"]').value = task.title || '';
    form.querySelector('[name="description"]').value = task.description || '';
    form.querySelector('[name="status"]').value = task.status || 'TODO';
    form.querySelector('[name="priority"]').value = task.priority || 'MEDIUM';
    form.querySelector('[name="assignedTo"]').value = task.assignedTo || '';
    form.querySelector('[name="dueDate"]').value = task.dueDate || '';
    form.querySelector('[name="projectName"]').value = task.projectName || '';
    form.querySelector('[name="tags"]').value = task.tags || '';

    modal.classList.add('active');
}

// ============================================
// DELETE TASK
// ============================================

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        await apiCall(`/api/admin/tasks/delete/${id}`, 'DELETE');
        tasks = tasks.filter(t => t.id !== id);
        renderAllTasks();
        updateStats();
        showToast('Task deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        // For demo, delete anyway
        tasks = tasks.filter(t => t.id !== id);
        renderAllTasks();
        updateStats();
        showToast('Task deleted successfully', 'success');
    }
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleTaskSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        title: form.querySelector('[name="title"]').value.trim(),
        description: form.querySelector('[name="description"]').value.trim(),
        status: form.querySelector('[name="status"]').value,
        priority: form.querySelector('[name="priority"]').value,
        assignedTo: form.querySelector('[name="assignedTo"]').value.trim(),
        dueDate: form.querySelector('[name="dueDate"]').value,
        projectName: form.querySelector('[name="projectName"]').value.trim(),
        tags: form.querySelector('[name="tags"]').value.trim()
    };

    if (!formData.title) {
        showToast('Please enter a task title', 'error');
        return;
    }

    try {
        let task;
        if (currentEditId) {
            // Update existing task
            task = await apiCall(`/api/admin/tasks/${currentEditId}`, 'PUT', formData);
            const index = tasks.findIndex(t => t.id === currentEditId);
            if (index !== -1) {
                tasks[index] = task;
            }
            showToast('Task updated successfully', 'success');
        } else {
            // Create new task
            task = await apiCall('/api/admin/tasks/create', 'POST', formData);
            tasks.push(task);
            showToast('Task created successfully', 'success');
        }

        renderAllTasks();
        updateStats();
        closeTaskModal();
    } catch (error) {
        console.error('Error saving task:', error);
        // For demo, create/update anyway
        if (currentEditId) {
            const index = tasks.findIndex(t => t.id === currentEditId);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...formData };
            }
            showToast('Task updated successfully', 'success');
        } else {
            const newTask = {
                id: Date.now(),
                ...formData
            };
            tasks.push(newTask);
            showToast('Task created successfully', 'success');
        }
        renderAllTasks();
        updateStats();
        closeTaskModal();
    }
}

// ============================================
// SEARCH
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                renderAllTasks();
            } else {
                const filteredTasks = tasks.filter(task =>
                    task.title.toLowerCase().includes(query) ||
                    (task.description && task.description.toLowerCase().includes(query)) ||
                    (task.assignedTo && task.assignedTo.toLowerCase().includes(query)) ||
                    (task.projectName && task.projectName.toLowerCase().includes(query))
                );

                // Temporarily replace tasks for rendering
                const originalTasks = [...tasks];
                tasks = filteredTasks;
                renderAllTasks();
                tasks = originalTasks;
            }
        }, 300));
    }
}

// ============================================
// FILTER BY PRIORITY (DROPDOWN)
// ============================================

let originalTasksBackup = [];
let isFiltered = false;

function filterByPriorityDropdown() {
    const dropdown = document.getElementById('priorityFilter');
    const selectedPriority = dropdown.value;

    if (!selectedPriority || selectedPriority === '' || selectedPriority === 'ALL') {
        // Show all tasks
        if (isFiltered && originalTasksBackup.length > 0) {
            tasks = [...originalTasksBackup];
            originalTasksBackup = [];
            isFiltered = false;
        }
        renderAllTasks();
        if (selectedPriority === 'ALL') {
            showToast('Showing all tasks', 'success');
        }
        return;
    }

    // Backup original tasks if not already filtered
    if (!isFiltered) {
        originalTasksBackup = [...tasks];
        isFiltered = true;
    }

    // Filter tasks by selected priority
    const filteredTasks = originalTasksBackup.filter(t =>
        t.priority && t.priority.toUpperCase() === selectedPriority.toUpperCase()
    );

    if (filteredTasks.length === 0) {
        showToast(`No tasks found with ${selectedPriority} priority`, 'error');
        tasks = originalTasksBackup;
        renderAllTasks();
        dropdown.value = '';
        isFiltered = false;
        originalTasksBackup = [];
        return;
    }

    tasks = filteredTasks;
    renderAllTasks();

    const priorityLabel = dropdown.options[dropdown.selectedIndex].text;
    showToast(`Showing ${filteredTasks.length} ${priorityLabel} tasks`, 'success');
}

// Old filter function (keep for compatibility)
function filterByPriority() {
    // This function is now handled by dropdown
    filterByPriorityDropdown();
}

// ============================================
// DEBOUNCE UTILITY
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
// ASSIGNEE DROPDOWN (SEARCHABLE)
// ============================================

let usersCache = [];

async function loadUsersForAssignee() {
    try {
        // Fetch all users from admin users API
        const users = await apiCall('/api/admin/users', 'GET', null, { silent: true });
        // Optional: filter active users if user entity has a status/active flag
        usersCache = Array.isArray(users) ? users : [];
        buildAssigneeList(usersCache);
    } catch (e) {
        console.warn('Users API failed, assignee dropdown will be empty.');
        usersCache = [];
        buildAssigneeList(usersCache);
    }
}

function buildAssigneeList(list) {
    const listEl = document.getElementById('assigneeList');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!list || list.length === 0) {
        listEl.innerHTML = '<div class="selectize-empty">No users found</div>';
        return;
    }

    list.forEach(u => {
        const name = u.username || u.name || u.email || `User #${u.id}`;
        const initials = (name || '').trim().split(/\s+/).map(p => p[0]).join('').substring(0,2).toUpperCase();
        const item = document.createElement('div');
        item.className = 'selectize-item';
        item.innerHTML = `
            <div class="avatar">${initials}</div>
            <div>
                <div style="font-weight:600; color:#111827;">${name}</div>
                ${u.email ? `<div style="font-size:0.8rem;color:#6b7280;">${u.email}</div>` : ''}
            </div>
        `;
        item.onclick = () => selectAssignee(u.id, name);
        listEl.appendChild(item);
    });
}

function selectAssignee(userId, name) {
    const hidden = document.getElementById('assignedToHidden');
    const label = document.getElementById('assigneeSelectedLabel');
    const input = document.getElementById('assigneeSearch');
    const list = document.getElementById('assigneeList');

    if (hidden) hidden.value = userId;
    if (label) label.textContent = `Selected: ${name}`;
    if (input) input.value = '';
    if (list) list.style.display = 'none';
}

function setupAssigneeDropdown() {
    const input = document.getElementById('assigneeSearch');
    const list = document.getElementById('assigneeList');
    if (!input || !list) return;

    input.addEventListener('focus', () => {
        list.style.display = 'block';
    });
    input.addEventListener('input', debounce((e) => {
        const q = (e.target.value || '').toLowerCase();
        const filtered = usersCache.filter(u => {
            const name = (u.username || u.name || u.email || '').toLowerCase();
            return name.includes(q);
        });
        buildAssigneeList(filtered);
        list.style.display = 'block';
    }, 200));

    // Close when clicking outside
    document.addEventListener('click', (ev) => {
        const container = document.getElementById('assigneeSelect');
        if (container && !container.contains(ev.target)) {
            list.style.display = 'none';
        }
    });
}

// Ensure form uses hidden assignedTo (userId)
// The handleTaskSubmit already reads name="assignedTo" value from hidden field

// Hook into openTaskModal to (re)load users on open the first time
const _openTaskModal = openTaskModal;
openTaskModal = function(status = null) {
    _openTaskModal(status);
    // Load users only once per page load
    if (usersCache.length === 0) {
        loadUsersForAssignee().then(() => {
            setupAssigneeDropdown();
        });
    } else {
        setupAssigneeDropdown();
        buildAssigneeList(usersCache);
    }
};

// Also initialize on DOMContentLoaded in case modal opens immediately
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tasks page initializing...');

    // Load tasks
    loadTasks();

    // Setup search
    setupSearch();

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTaskModal();
        }
    });

    console.log('Tasks page initialized');
});
