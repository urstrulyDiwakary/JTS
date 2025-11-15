// Admin Dashboard JavaScript - Dynamic data and functionality

let dashboardData = {
    users: [],
    projects: [],
    billings: []
};

// ============================================
// LOAD DASHBOARD DATA
// ============================================

async function loadDashboardData() {
    try {
        // Fetch data from all APIs
        const [users, projects, billings] = await Promise.all([
            apiCall('/api/admin/users').catch(() => []),
            apiCall('/api/admin/projects').catch(() => []),
            apiCall('/api/admin/billing').catch(() => [])
        ]);

        dashboardData.users = users;
        dashboardData.projects = projects;
        dashboardData.billings = billings;

        // Update all dashboard sections
        updateStatCards();
        updateRecentProjects();
        updateRecentActivity();

        showToast('Dashboard loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============================================
// UPDATE STAT CARDS
// ============================================

function updateStatCards() {
    const { users, projects, billings } = dashboardData;

    // Total Users
    const totalUsers = users.length;
    const userGrowth = calculateGrowth(users, 'month');
    updateStatCard(0, totalUsers, userGrowth);

    // Total Revenue
    const totalRevenue = billings
        .filter(b => b.status === 'PAID')
        .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const revenueGrowth = calculateRevenueGrowth(billings);
    updateStatCard(1, formatCurrency(totalRevenue), revenueGrowth);

    // Active Projects
    const activeProjects = projects.filter(p =>
        p.status === 'ACTIVE' || p.status === 'IN_PROGRESS'
    ).length;
    const newThisWeek = projects.filter(p => isThisWeek(p.createdDate)).length;
    updateStatCard(2, activeProjects, newThisWeek, 'new this week');

    // Success Rate
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const successRate = projects.length > 0
        ? ((completedProjects / projects.length) * 100).toFixed(1)
        : 0;
    updateStatCard(3, `${successRate}%`, -2.1);
}

function updateStatCard(index, value, change, suffix = 'from last month') {
    const cards = document.querySelectorAll('.stat-card');
    if (cards[index]) {
        const valueElement = cards[index].querySelector('.stat-info h3');
        const changeElement = cards[index].querySelector('.stat-change span');

        if (valueElement) valueElement.textContent = value;
        if (changeElement) {
            const isPositive = change >= 0;
            const parent = changeElement.parentElement;
            parent.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
            parent.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                <span>${Math.abs(change)}% ${suffix}</span>
            `;
        }
    }
}

// ============================================
// UPDATE RECENT PROJECTS TABLE
// ============================================

function updateRecentProjects() {
    const { projects } = dashboardData;
    const tbody = document.querySelector('.table-container tbody');

    if (!tbody) return;

    // Get last 5 projects
    const recentProjects = projects.slice(0, 5);

    if (recentProjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">No projects found</td></tr>';
        return;
    }

    tbody.innerHTML = recentProjects.map(project => `
        <tr data-project-id="${project.id}">
            <td><strong>${project.name}</strong></td>
            <td>${project.clientName || 'N/A'}</td>
            <td>${formatDate(project.startDate || new Date())}</td>
            <td><span class="status-badge ${getStatusClass(project.status)}">${project.status || 'Pending'}</span></td>
            <td>${project.progress || calculateProgress(project)}%</td>
            <td>
                <button class="action-btn edit" onclick="editProjectFromDashboard(${project.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteProjectFromDashboard(${project.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'in_progress' || statusLower === 'completed') {
        return 'active';
    }
    if (statusLower === 'pending') return 'pending';
    return 'inactive';
}

function calculateProgress(project) {
    // Simple progress calculation based on status
    const statusProgress = {
        'PENDING': 10,
        'ACTIVE': 50,
        'IN_PROGRESS': 50,
        'COMPLETED': 100,
        'ON_HOLD': 30
    };
    return statusProgress[project.status] || 30;
}

// ============================================
// UPDATE RECENT ACTIVITY
// ============================================

function updateRecentActivity() {
    const { users, projects, billings } = dashboardData;
    const activityList = document.querySelector('.activity-list');

    if (!activityList) return;

    const activities = [];

    // Add recent user registrations
    users.slice(0, 2).forEach(user => {
        activities.push({
            icon: 'fa-user-plus',
            iconClass: 'blue',
            title: 'New User Registered',
            description: `${user.username} joined the platform`,
            time: 'Recently'
        });
    });

    // Add recent project completions
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').slice(0, 1);
    completedProjects.forEach(project => {
        activities.push({
            icon: 'fa-check-circle',
            iconClass: 'green',
            title: 'Project Completed',
            description: `${project.name} delivered`,
            time: 'Recently'
        });
    });

    // Add pending payments
    const pendingBillings = billings.filter(b => b.status === 'PENDING').slice(0, 1);
    pendingBillings.forEach(billing => {
        activities.push({
            icon: 'fa-exclamation-triangle',
            iconClass: 'orange',
            title: 'Payment Pending',
            description: `Invoice ${billing.invoiceNumber || '#' + billing.id} requires attention`,
            time: 'Pending'
        });
    });

    // Default activity if no data
    if (activities.length === 0) {
        activities.push({
            icon: 'fa-info-circle',
            iconClass: 'blue',
            title: 'Welcome to Dashboard',
            description: 'Start by adding users, projects, or invoices',
            time: 'Now'
        });
    }

    activityList.innerHTML = activities.map(activity => `
        <li class="activity-item">
            <div class="activity-icon ${activity.iconClass}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <p style="font-size: 0.75rem; margin-top: 5px;">${activity.time}</p>
            </div>
        </li>
    `).join('');
}

// ============================================
// PROJECT ACTIONS FROM DASHBOARD
// ============================================

async function editProjectFromDashboard(id) {
    // Redirect to projects page with edit intent
    window.location.href = `/admin/projects?edit=${id}`;
}

async function deleteProjectFromDashboard(id) {
    confirmAction('Are you sure you want to delete this project?', async () => {
        try {
            await apiCall(`/api/admin/projects/delete/${id}`, 'DELETE');
            dashboardData.projects = dashboardData.projects.filter(p => p.id !== id);
            updateRecentProjects();
            updateStatCards();
            showToast('Project deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    });
}

function addNewProject() {
    window.location.href = '/admin/projects';
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function setupDashboardSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase();
            if (!query) {
                updateRecentProjects();
                return;
            }

            // Search in projects
            const filteredProjects = dashboardData.projects.filter(project =>
                project.name.toLowerCase().includes(query) ||
                (project.clientName && project.clientName.toLowerCase().includes(query)) ||
                (project.description && project.description.toLowerCase().includes(query))
            );

            // Update table with filtered results
            const tbody = document.querySelector('.table-container tbody');
            if (!tbody) return;

            if (filteredProjects.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">No matching projects found</td></tr>';
                return;
            }

            tbody.innerHTML = filteredProjects.slice(0, 5).map(project => `
                <tr data-project-id="${project.id}">
                    <td><strong>${project.name}</strong></td>
                    <td>${project.clientName || 'N/A'}</td>
                    <td>${formatDate(project.startDate || new Date())}</td>
                    <td><span class="status-badge ${getStatusClass(project.status)}">${project.status || 'Pending'}</span></td>
                    <td>${project.progress || calculateProgress(project)}%</td>
                    <td>
                        <button class="action-btn edit" onclick="editProjectFromDashboard(${project.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProjectFromDashboard(${project.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }, 300));
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateGrowth(items, period) {
    // Simple growth calculation - you can enhance this
    return (Math.random() * 20).toFixed(1); // Mock data for now
}

function calculateRevenueGrowth(billings) {
    // Calculate revenue growth compared to previous period
    const thisMonth = new Date().getMonth();
    const thisMonthRevenue = billings
        .filter(b => b.paidDate && new Date(b.paidDate).getMonth() === thisMonth && b.status === 'PAID')
        .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthRevenue = billings
        .filter(b => b.paidDate && new Date(b.paidDate).getMonth() === lastMonth && b.status === 'PAID')
        .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

    if (lastMonthRevenue === 0) return 0;
    return (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1);
}

function isThisWeek(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= now;
}

// ============================================
// CHART PLACEHOLDER INTERACTION
// ============================================

function setupChartInteraction() {
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.cursor = 'pointer';
        chartContainer.addEventListener('click', () => {
            window.location.href = '/admin/analytics';
        });
        chartContainer.title = 'Click to view detailed analytics';
    }
}

// ============================================
// NOTIFICATION AND SETTINGS ICONS
// ============================================

function setupTopBarIcons() {
    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', () => {
            showToast('No new notifications', 'success');
        });
        notificationIcon.style.cursor = 'pointer';
    }

    // Settings icon
    const settingsIcon = document.querySelector('.settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            window.location.href = '/admin/settings';
        });
        settingsIcon.style.cursor = 'pointer';
    }

    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            showToast('Profile menu - Coming soon', 'success');
        });
        userProfile.style.cursor = 'pointer';
    }
}

// ============================================
// PERIOD SELECTOR
// ============================================

function setupPeriodSelector() {
    const selector = document.querySelector('.card-header select');
    if (selector) {
        selector.addEventListener('change', (e) => {
            showToast(`Filtering by: ${e.target.value}`, 'success');
            // You can add filtering logic here
        });
    }
}

// ============================================
// ADD NEW PROJECT BUTTON
// ============================================

function setupAddProjectButton() {
    const addButton = document.querySelector('.card-header .action-btn');
    if (addButton) {
        addButton.onclick = addNewProject;
    }
}

// ============================================
// AUTO REFRESH
// ============================================

function setupAutoRefresh() {
    // Refresh dashboard every 5 minutes
    setInterval(() => {
        loadDashboardData();
    }, 5 * 60 * 1000);
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');

    // Load all data
    loadDashboardData();

    // Setup search
    setupDashboardSearch();

    // Setup chart interaction
    setupChartInteraction();

    // Setup top bar icons
    setupTopBarIcons();

    // Setup period selector
    setupPeriodSelector();

    // Setup add project button
    setupAddProjectButton();

    // Setup auto refresh
    setupAutoRefresh();

    console.log('Dashboard initialized successfully');
});

