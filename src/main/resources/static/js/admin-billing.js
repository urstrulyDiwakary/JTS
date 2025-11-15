// Billing Management JavaScript

let billings = [];
let filteredBillings = [];
let currentPage = 1;
const billingsPerPage = 10;
let currentEditId = null;

// ============================================
// LOAD BILLINGS
// ============================================

async function loadBillings() {
    try {
        billings = await apiCall('/api/admin/billing', 'GET', null, { silent: true });
        filteredBillings = [...billings];
        renderBillings();
        updateStats();
        showToast('Billing data loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading billings:', error);
        showToast('Failed to load billing data', 'error');
        // Initialize empty state
        billings = [];
        filteredBillings = [];
        renderBillings();
        updateStats();
    }
}

// ============================================
// RENDER BILLINGS
// ============================================

function renderBillings() {
    const startIndex = (currentPage - 1) * billingsPerPage;
    const endIndex = startIndex + billingsPerPage;
    const paginatedBillings = filteredBillings.slice(startIndex, endIndex);

    const tbody = document.querySelector('.billing-table tbody');
    if (!tbody) return;

    if (paginatedBillings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">No billing records found</td></tr>';
        // Clear pagination if no results
        const paginationEl = document.querySelector('.pagination');
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }

    tbody.innerHTML = paginatedBillings.map(billing => {
        const statusClass = (billing.status || 'pending').toLowerCase();
        const isPaid = (billing.status || '').toUpperCase() === 'PAID';

        return `
        <tr data-billing-id="${billing.id}">
            <td><strong>${billing.invoiceNumber || `INV-${billing.id}`}</strong></td>
            <td>${billing.clientName || billing.project?.clientName || 'N/A'}</td>
            <td>${formatCurrency(billing.amount || 0)}</td>
            <td><span class="status-badge status-${statusClass}">${billing.status || 'Pending'}</span></td>
            <td>${formatDate(billing.dueDate)}</td>
            <td>${billing.paidDate ? formatDate(billing.paidDate) : '-'}</td>
            <td>
                <button class="action-btn" onclick="viewBilling(${billing.id})" title="View"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="editBilling(${billing.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="downloadInvoicePdf(${billing.id})" title="Download PDF" style="background:#dbeafe; color:#2563eb;"><i class="fas fa-download"></i></button>
                <button class="action-btn" onclick="shareInvoicePdf(${billing.id})" title="Share PDF" style="background:#d1fae5; color:#10b981;"><i class="fas fa-share-alt"></i></button>
                <button class="action-btn" onclick="deleteBilling(${billing.id})" title="Delete"><i class="fas fa-trash"></i></button>
                ${!isPaid ? `<button class="action-btn" onclick="markAsPaid(${billing.id})" title="Mark as Paid"><i class="fas fa-check"></i></button>` : ''}
            </td>
        </tr>
        `;
    }).join('');

    // Setup pagination only if we have results
    if (filteredBillings.length > 0) {
        setupPagination(filteredBillings.length, billingsPerPage, currentPage, (page) => {
            currentPage = page;
            renderBillings();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ============================================
// UPDATE STATS
// ============================================

function updateStats() {
    const totalRevenue = billings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const paidAmount = billings.filter(b => (b.status || '').toUpperCase() === 'PAID').reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const pendingAmount = billings.filter(b => (b.status || '').toUpperCase() === 'PENDING').reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const overdueAmount = billings.filter(b => (b.status || '').toUpperCase() === 'OVERDUE').reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

    // Update stat cards with correct IDs
    const totalRevEl = document.getElementById('totalRevenue');
    const paidAmtEl = document.getElementById('paidAmount');
    const pendingAmtEl = document.getElementById('pendingAmount');
    const overdueAmtEl = document.getElementById('overdueAmount');

    if (totalRevEl) totalRevEl.textContent = formatCurrency(totalRevenue);
    if (paidAmtEl) paidAmtEl.textContent = formatCurrency(paidAmount);
    if (pendingAmtEl) pendingAmtEl.textContent = formatCurrency(pendingAmount);
    if (overdueAmtEl) overdueAmtEl.textContent = formatCurrency(overdueAmount);
}

// ============================================
// BILLING ACTIONS
// ============================================

function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Find the highest invoice number for this year-month
    const prefix = `INV-${year}-${month}`;
    const existingNumbers = billings
        .filter(b => b.invoiceNumber && b.invoiceNumber.startsWith(prefix))
        .map(b => {
            const match = b.invoiceNumber.match(/INV-\d{4}-\d{2}-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = String(maxNumber + 1).padStart(3, '0');

    return `${prefix}-${nextNumber}`;
}

function openAddBillingModal() {
    currentEditId = null;
    const modal = document.getElementById('billingModal');
    if (!modal) {
        console.error('Billing modal not found');
        return;
    }

    const form = modal.querySelector('form');
    if (!form) {
        console.error('Billing form not found');
        return;
    }

    modal.querySelector('.modal-header h2').textContent = 'Add New Invoice';
    form.reset();

    // Auto-generate invoice number
    const invoiceInput = form.querySelector('input[name="invoiceNumber"]');
    if (invoiceInput) {
        const generatedNumber = generateInvoiceNumber();
        invoiceInput.value = generatedNumber;
        console.log('Generated invoice number:', generatedNumber);
    } else {
        console.error('Invoice number input not found');
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Add Invoice';
    }

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentEditId = null;
    }
}

function viewBilling(id) {
    const billing = billings.find(b => b.id === id);
    if (!billing) return;

    alert(`Billing Details:\n\nInvoice: ${billing.invoiceNumber || `INV-${billing.id}`}\nClient: ${billing.clientName || 'N/A'}\nAmount: ${formatCurrency(billing.amount || 0)}\nStatus: ${billing.status || 'Pending'}\nDue Date: ${formatDate(billing.dueDate)}\nPaid Date: ${billing.paidDate ? formatDate(billing.paidDate) : 'Not paid'}\nNotes: ${billing.notes || 'None'}`);
}

async function editBilling(id) {
    const billing = billings.find(b => b.id === id);
    if (!billing) return;

    currentEditId = id;
    const modal = document.getElementById('billingModal');
    const form = modal.querySelector('form');

    modal.querySelector('.modal-header h2').textContent = 'Edit Invoice';

    // Fill form with billing data
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.name === 'invoiceNumber') input.value = billing.invoiceNumber || '';
        if (input.name === 'clientName') input.value = billing.clientName || '';
        if (input.name === 'amount') input.value = billing.amount || '';
        if (input.name === 'dueDate') input.value = billing.dueDate || '';
        if (input.name === 'notes') input.value = billing.notes || '';
        if (input.name === 'status') {
            Array.from(input.options).forEach(option => {
                if (option.value.toUpperCase() === (billing.status || 'PENDING').toUpperCase()) {
                    option.selected = true;
                }
            });
        }
    });

    form.querySelector('button[type="submit"]').textContent = 'Update Invoice';

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function deleteBilling(id) {
    confirmAction('Are you sure you want to delete this billing record?', async () => {
        try {
            await apiCall(`/api/admin/billing/delete/${id}`, 'DELETE');
            billings = billings.filter(b => b.id !== id);
            filteredBillings = filteredBillings.filter(b => b.id !== id);
            renderBillings();
            updateStats();
            showToast('Billing record deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting billing:', error);
        }
    });
}

async function markAsPaid(id) {
    try {
        const billing = billings.find(b => b.id === id);
        if (!billing) {
            showToast('Invoice not found', 'error');
            return;
        }

        // Create update data with all required fields
        const updateData = {
            invoiceNumber: billing.invoiceNumber,
            clientName: billing.clientName,
            amount: billing.amount,
            status: 'PAID',
            dueDate: billing.dueDate,
            paidDate: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0],
            notes: billing.notes || ''
        };

        console.log('Marking as paid with data:', updateData);

        const updated = await apiCall(`/api/admin/billing/${id}`, 'PUT', updateData, { silent: true });
        const index = billings.findIndex(b => b.id === id);
        if (index !== -1) {
            billings[index] = updated;
        }

        filteredBillings = [...billings];
        renderBillings();
        updateStats();
        showToast('Invoice marked as paid', 'success');
    } catch (error) {
        console.error('Error updating billing:', error);
        showToast('Failed to mark invoice as paid', 'error');
    }
}

// ============================================
// DOWNLOAD & SHARE INVOICE PDF
// ============================================

function downloadInvoicePdf(id) {
    const billing = billings.find(b => b.id === id);
    if (!billing) {
        showToast('Invoice not found', 'error');
        return;
    }

    const filename = (billing.invoiceNumber || `invoice-${id}`) + '.pdf';
    const url = `/api/admin/billing/${id}/pdf`;

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Downloading invoice...', 'success');
}

async function shareInvoicePdf(id) {
    const billing = billings.find(b => b.id === id);
    if (!billing) {
        showToast('Invoice not found', 'error');
        return;
    }

    const filename = (billing.invoiceNumber || `invoice-${id}`) + '.pdf';
    const url = `/api/admin/billing/${id}/pdf`;

    try {
        // Fetch the PDF as blob
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch PDF');
        }

        const blob = await response.blob();
        const file = new File([blob], filename, { type: 'application/pdf' });

        // Check if Web Share API is supported
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `Invoice ${billing.invoiceNumber || id}`,
                text: `Invoice for ${billing.clientName || 'client'}`,
                files: [file]
            });
            showToast('Invoice shared successfully', 'success');
        } else {
            // Fallback: Download if share is not supported
            showToast('Share not supported. Downloading instead...', 'info');
            downloadInvoicePdf(id);
        }
    } catch (error) {
        console.error('Error sharing invoice:', error);
        if (error.name === 'AbortError') {
            // User cancelled the share
            console.log('Share cancelled by user');
        } else {
            showToast('Failed to share. Downloading instead...', 'info');
            downloadInvoicePdf(id);
        }
    }
}

function showInvoiceCreatedModal(invoiceId) {
    const billing = billings.find(b => b.id === invoiceId);
    if (!billing) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '1000';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <i class="fas fa-check-circle" style="font-size: 64px; color: var(--success);"></i>
            </div>
            <h2 style="margin-bottom: 10px;">Invoice Created Successfully!</h2>
            <p style="color: #6b7280; margin-bottom: 30px;">Invoice ${billing.invoiceNumber || invoiceId} has been created.</p>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button class="btn btn-primary" onclick="downloadInvoicePdf(${invoiceId}); this.closest('.modal').remove();" style="width: 100%; justify-content: center;">
                    <i class="fas fa-download"></i>
                    Download Invoice PDF
                </button>
                <button class="btn" onclick="shareInvoicePdf(${invoiceId}); this.closest('.modal').remove();" style="width: 100%; justify-content: center; background: #10b981; color: white;">
                    <i class="fas fa-share-alt"></i>
                    Share Invoice
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove();" style="width: 100%; justify-content: center;">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleBillingSubmit(event) {
    event.preventDefault();
    console.log('Form submitted');

    const form = event.target;
    const formData = {};

    // Collect form data
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.name) {
            formData[input.name] = input.value;
        }
    });

    console.log('Form data collected:', formData);

    // Validate required fields
    if (!formData.invoiceNumber || !formData.amount || !formData.dueDate || !formData.status) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    // Convert amount to BigDecimal compatible number
    if (formData.amount) {
        formData.amount = parseFloat(formData.amount);
    }

    // Convert dueDate from YYYY-MM-DD to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    if (formData.dueDate) {
        formData.dueDate = formData.dueDate + 'T23:59:59';
    }

    // Remove empty fields
    Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
            delete formData[key];
        }
    });

    console.log('Processed form data:', formData);

    try {
        let result;
        let isNewInvoice = !currentEditId;

        if (currentEditId) {
            // Update existing billing
            console.log('Updating billing:', currentEditId);
            result = await apiCall(`/api/admin/billing/${currentEditId}`, 'PUT', formData);
            const index = billings.findIndex(b => b.id === currentEditId);
            if (index !== -1) {
                billings[index] = result;
            }
            showToast('Invoice updated successfully', 'success');
        } else {
            // Create new billing
            console.log('Creating new billing with data:', formData);
            result = await apiCall('/api/admin/billing/create', 'POST', formData);
            console.log('Created billing:', result);
            billings.unshift(result); // Add to beginning of array
            showToast('Invoice created successfully', 'success');
        }

        filteredBillings = [...billings];
        renderBillings();
        updateStats();

        // Close modal
        const modal = document.getElementById('billingModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        currentEditId = null;

        // Show success message with download option for new invoices
        if (isNewInvoice && result && result.id) {
            showInvoiceCreatedModal(result.id);
        }
    } catch (error) {
        console.error('Error saving billing:', error);
        // Show more detailed error if available
        const errorMessage = error.message || 'Failed to save invoice. Please try again.';
        showToast(errorMessage, 'error');
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
            filteredBillings = billings.filter(billing =>
                (billing.invoiceNumber && billing.invoiceNumber.toLowerCase().includes(query)) ||
                (billing.clientName && billing.clientName.toLowerCase().includes(query))
            );
            currentPage = 1;
            renderBillings();
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
    const statusFilter = document.querySelector('.filter-group select')?.value;

    filteredBillings = billings.filter(billing => {
        if (statusFilter && statusFilter !== 'All Status') {
            if ((billing.status || '').toUpperCase() !== statusFilter.toUpperCase()) return false;
        }
        return true;
    });

    currentPage = 1;
    renderBillings();
}

// ============================================
// EXPORT
// ============================================

function exportBillings() {
    exportToCSV(billings, 'billings');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load billings from API
    loadBillings();

    // Setup search
    setupSearch();

    // Setup filters
    setupFilters();

    // Setup form submission
    const form = document.querySelector('#billingModal form');
    if (form) {
        form.addEventListener('submit', handleBillingSubmit);
    }

    // Setup export button
    const exportBtn = document.querySelector('.btn-secondary');
    if (exportBtn && exportBtn.textContent.includes('Export')) {
        exportBtn.onclick = exportBillings;
    }
});

