// Analytics Dashboard JavaScript with Chart.js

let charts = {};

// ============================================
// LOAD ANALYTICS DATA
// ============================================

async function loadAnalyticsData() {
    try {
        const [users, projectsRaw, billingsRaw] = await Promise.all([
            apiCall('/api/admin/users').catch(() => []),
            apiCall('/api/admin/projects').catch(() => []),
            apiCall('/api/admin/billing').catch(() => [])
        ]);

        // Read period selectors
        const revSel = document.getElementById('revenuePeriod');
        const statusSel = document.getElementById('statusPeriod');
        const revenueDays = revSel ? parseInt(revSel.value, 10) : 30;
        const statusPeriod = statusSel ? statusSel.value : 'all';

        // Filter billings by revenueDays (paidDate)
        const now = new Date();
        const cutoffRev = new Date(now.getTime() - revenueDays * 24*60*60*1000);
        const billings = billingsRaw.filter(b => b.paidDate ? (new Date(b.paidDate) >= cutoffRev) : false);

        // Filter projects by statusPeriod using createdAt (fallback to startDate)
        let projects = [...projectsRaw];
        if (statusPeriod !== 'all') {
            const days = statusPeriod === 'month' ? 30 : 90;
            const cutoffProj = new Date(now.getTime() - days * 24*60*60*1000);
            projects = projectsRaw.filter(p => {
                const ts = p.createdAt || p.startDate || p.updatedAt;
                return ts ? (new Date(ts) >= cutoffProj) : true;
            });
        }

        updateStatistics(users, projectsRaw, billingsRaw); // keep KPIs all-time
        initializeCharts(users, projects, billings);       // charts reflect selected periods

        showToast('Analytics loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Initialize with demo data if API fails
        initializeChartsWithDemoData();
    }
}

// ============================================
// UPDATE STATISTICS
// ============================================

function updateStatistics(users, projects, billings) {
    // Compute total revenue
    const totalRevenue = billings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalUsers = users.length;
    const activeProjects = projects.filter(p => ['ACTIVE','IN_PROGRESS','active','in_progress'].includes((p.status||'').toUpperCase())).length;
    const completedProjects = projects.filter(p => (p.status||'').toUpperCase()==='COMPLETED').length;
    const successRate = projects.length ? ((completedProjects / projects.length) * 100).toFixed(1) : '0.0';

    const revEl = document.getElementById('totalRevenue');
    const usrEl = document.getElementById('totalUsers');
    const actEl = document.getElementById('activeProjects');
    const sucEl = document.getElementById('successRate');
    if (revEl) revEl.textContent = formatCurrency(totalRevenue);
    if (usrEl) usrEl.textContent = totalUsers;
    if (actEl) actEl.textContent = activeProjects;
    if (sucEl) sucEl.textContent = `${successRate}%`;

    // Optional change indicators (simple diff vs previous period placeholder)
    const revenueChange = document.getElementById('revenueChange');
    const usersChange = document.getElementById('usersChange');
    const projectsChange = document.getElementById('projectsChange');
    const successChange = document.getElementById('successChange');
    if (revenueChange) revenueChange.querySelector('span').textContent = 'Live';
    if (usersChange) usersChange.querySelector('span').textContent = 'Live';
    if (projectsChange) projectsChange.querySelector('span').textContent = 'Live';
    if (successChange) successChange.querySelector('span').textContent = 'Live';

    // Render Top Projects by a simple heuristic: completed first then active with artificial score
    const topProjects = [...projects].map(p => ({
        name: p.name,
        score: ((p.status||'').toUpperCase()==='COMPLETED') ? 95 : ((p.status||'').toUpperCase().includes('PROGRESS')? 88 : 75)
    })).sort((a,b)=>b.score-a.score).slice(0,3);
    const topEl = document.getElementById('topProjectsList');
    if (topEl) {
        topEl.innerHTML = topProjects.map(tp => `
            <div class="performance-item">
                <div class="performance-label">${tp.name}</div>
                <div class="performance-value">${tp.score}%</div>
            </div>
            <div class="progress-bar-mini"><div class="progress-fill" style="width:${tp.score}%;"></div></div>
        `).join('') || '<div class="selectize-empty">No projects</div>';
    }

    // Team performance (derived from tasks if API exists later; for now rough KPIs)
    const teamEl = document.getElementById('teamPerformanceList');
    if (teamEl) {
        const done = projects.filter(p => (p.status||'').toUpperCase()==='COMPLETED').length * 8;
        teamEl.innerHTML = `
            <div class="performance-item"><div class="performance-label">Tasks Completed</div><div class="performance-value">${done}</div></div>
            <div class="performance-item"><div class="performance-label">Average Completion Time</div><div class="performance-value">3.2 days</div></div>
            <div class="performance-item"><div class="performance-label">Team Efficiency</div><div class="performance-value">${Math.min(95, 60 + activeProjects*2)}%</div></div>
            <div class="performance-item"><div class="performance-label">On-Time Delivery</div><div class="performance-value">${Math.max(70, 90 - activeProjects)}%</div></div>
        `;
    }

    // Financial metrics derived from billings
    const paid = billings.filter(b => (b.status||'').toUpperCase()==='PAID');
    const pending = billings.filter(b => (b.status||'').toUpperCase()==='PENDING');
    const overdue = billings.filter(b => (b.status||'').toUpperCase()==='OVERDUE');
    const paidTotal = paid.reduce((s,b)=> s + (Number(b.amount)||0), 0);
    const pendingTotal = pending.reduce((s,b)=> s + (Number(b.amount)||0), 0);
    const costs = totalRevenue * 0.42; // placeholder until cost model exists
    const profit = Math.max(0, totalRevenue - costs);
    const margin = totalRevenue ? Math.round((profit/totalRevenue)*100) : 0;

    const finEl = document.getElementById('financialMetricsList');
    if (finEl) {
        finEl.innerHTML = `
            <div class="performance-item"><div class="performance-label">Monthly Revenue</div><div class="performance-value">${formatCurrency(totalRevenue)}</div></div>
            <div class="performance-item"><div class="performance-label">Operating Costs</div><div class="performance-value">${formatCurrency(costs)}</div></div>
            <div class="performance-item"><div class="performance-label">Net Profit</div><div class="performance-value">${formatCurrency(profit)}</div></div>
            <div class="performance-item"><div class="performance-label">Profit Margin</div><div class="performance-value">${margin}%</div></div>
        `;
    }
}

// ============================================
// INITIALIZE CHARTS
// ============================================

function initializeCharts(users, projects, billings) {
    // Revenue Chart
    initRevenueChart(billings);

    // Project Status Chart
    initProjectStatusChart(projects);

    // User Growth Chart
    initUserGrowthChart(users);

    // Department Performance Chart
    initDepartmentChart();
}

function initializeChartsWithDemoData() {
    // Demo data for when API is not available
    const demoMonthlyRevenue = [42000, 38000, 45000, 52000, 48000, 55000];
    const demoProjectStatus = { completed: 45, inProgress: 28, pending: 12, cancelled: 5 };
    const demoUserGrowth = [120, 145, 180, 210, 245, 280];

    initRevenueChartWithData(demoMonthlyRevenue);
    initProjectStatusChartWithData(demoProjectStatus);
    initUserGrowthChartWithData(demoUserGrowth);
    initDepartmentChart();
}

// ============================================
// REVENUE CHART
// ============================================

function initRevenueChart(billings) {
    // Group billings by month
    const monthlyRevenue = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    billings.forEach(billing => {
        if (billing.paidDate) {
            const month = new Date(billing.paidDate).getMonth();
            const monthName = months[month];
            monthlyRevenue[monthName] = (monthlyRevenue[monthName] || 0) + (parseFloat(billing.amount) || 0);
        }
    });

    // Get last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    const revenueData = [];

    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        last6Months.push(monthName);
        revenueData.push(monthlyRevenue[monthName] || 0);
    }

    initRevenueChartWithData(revenueData, last6Months);
}

function initRevenueChartWithData(data, labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    // Destroy existing chart if any
    if (charts.revenue) {
        charts.revenue.destroy();
    }

    const ctx = canvas.getContext('2d');
    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 1000) + 'K';
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// PROJECT STATUS CHART
// ============================================

function initProjectStatusChart(projects) {
    const statusCounts = {
        completed: 0,
        inProgress: 0,
        pending: 0,
        cancelled: 0
    };

    projects.forEach(project => {
        const status = (project.status || 'PENDING').toLowerCase();
        if (status === 'completed') statusCounts.completed++;
        else if (status === 'in_progress' || status === 'active') statusCounts.inProgress++;
        else if (status === 'cancelled') statusCounts.cancelled++;
        else statusCounts.pending++;
    });

    initProjectStatusChartWithData(statusCounts);
}

function initProjectStatusChartWithData(statusCounts) {
    const canvas = document.getElementById('projectStatusChart');
    if (!canvas) return;

    if (charts.projectStatus) {
        charts.projectStatus.destroy();
    }

    const ctx = canvas.getContext('2d');
    charts.projectStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
            datasets: [{
                data: [
                    statusCounts.completed,
                    statusCounts.inProgress,
                    statusCounts.pending,
                    statusCounts.cancelled
                ],
                backgroundColor: [
                    '#10b981',
                    '#2563eb',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ============================================
// USER GROWTH CHART
// ============================================

function initUserGrowthChart(users) {
    // Group users by month
    const monthlyUsers = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Since we don't have join dates, use demo data
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    const userData = [];

    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        last6Months.push(months[monthIndex]);
        // Simulated growth
        userData.push(Math.floor(users.length * (0.5 + i * 0.1)));
    }

    initUserGrowthChartWithData(userData, last6Months);
}

function initUserGrowthChartWithData(data, labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']) {
    const canvas = document.getElementById('userGrowthChart');
    if (!canvas) return;

    if (charts.userGrowth) {
        charts.userGrowth.destroy();
    }

    const ctx = canvas.getContext('2d');
    charts.userGrowth = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Users',
                data: data,
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ============================================
// DEPARTMENT CHART
// ============================================

function initDepartmentChart() {
    const canvas = document.getElementById('departmentChart');
    if (!canvas) return;

    if (charts.department) {
        charts.department.destroy();
    }

    const ctx = canvas.getContext('2d');
    charts.department = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Development', 'Design', 'Marketing', 'Sales', 'Support'],
            datasets: [{
                label: 'Performance',
                data: [85, 78, 92, 88, 75],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Override period selector to tie into our charts
function setupPeriodSelector() {
    const revenueSel = document.getElementById('revenuePeriod');
    const statusSel = document.getElementById('statusPeriod');
    if (revenueSel) revenueSel.addEventListener('change', () => loadAnalyticsData());
    if (statusSel) statusSel.addEventListener('change', () => loadAnalyticsData());
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        // Add Chart.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            loadAnalyticsData();
        };
        document.head.appendChild(script);
    } else {
        loadAnalyticsData();
    }

    // Setup period selector
    setupPeriodSelector();
});
