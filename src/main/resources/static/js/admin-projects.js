// Projects Management JavaScript - Version 4.1 - ENHANCED VIEW MODE UI
console.log('🎨 PROJECTS JS v4.1 LOADED - ENHANCED VIEW MODE WITH CARD-BASED LAYOUT');
console.log('📋 Professional card-style boxes for better visual organization');
console.log('🎯 Improved project header with gradient design and status badges');
console.log('📊 Enhanced timeline visualization with progress indicators');
console.log('🗑️ Complete file management with deletion functionality');
console.log('🔧 Fixed whitelabel error for immediate file access');
console.log('🔧 Debug functions available: debugProjectFiles(id), addTestFilesToProject(id)');

let projects = [];
let filteredProjects = [];
let currentPage = 1;
const projectsPerPage = 6;
let currentEditId = null;

// ============================================
// LOAD PROJECTS
// ============================================

async function loadProjects() {
    try {
        projects = await apiCall('/api/admin/projects');
        console.log('📥 Projects loaded from API:', projects);
        console.log('- Number of projects:', projects.length);

        // Debug each project's filePaths in detail
        console.log('🚨 DETAILED PROJECT ANALYSIS:');
        projects.forEach(project => {
            console.log(`📋 Project ${project.id} (${project.name}):`);
            console.log('  - FilePaths value:', project.filePaths);
            console.log('  - FilePaths type:', typeof project.filePaths);
            console.log('  - FilePaths === null:', project.filePaths === null);
            console.log('  - FilePaths length:', project.filePaths ? project.filePaths.length : 'N/A');

            if (project.filePaths) {
                try {
                    const parsed = JSON.parse(project.filePaths);
                    console.log('  - Parsed successfully:', parsed);
                    console.log('  - Parsed length:', parsed.length);
                } catch (e) {
                    console.log('  - Parse failed:', e.message);
                }
            }
            console.log('  ---');
        });

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
            <div class="project-body">
                <span class="project-status status-${getStatusClass(project.status)}">${project.status || 'Pending'}</span>
                <h3>${project.name}</h3>
                <p>${project.description || 'No description available'}</p>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${project.clientName || 'Unknown Client'}</span>
                    </div>
                    ${generateFileCountInfo(project)}
                </div>
            </div>
            <div class="project-footer">
                <button class="card-btn view" onclick="viewProject(${project.id})" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="card-btn edit" onclick="editProject(${project.id})" title="Edit Project"><i class="fas fa-edit"></i></button>
                <button class="card-btn delete" onclick="deleteProject(${project.id})" title="Delete Project"><i class="fas fa-trash"></i></button>
                ${generateFileActionsButton(project)}
            </div>
        </div>
    `).join('');



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

// Helper function to generate project media display - REMOVED FOR SPACE OPTIMIZATION
function generateProjectMedia(project) {
    // Return empty to remove all image sections from project cards
    return '';
}

// Helper function to parse filePaths - FIXED VERSION
function getProjectFiles(project) {
    console.log('🔍 Getting project files for:', project.id, '(' + project.name + ')');
    console.log('- Raw filePaths value:', project.filePaths);
    console.log('- FilePaths type:', typeof project.filePaths);

    if (!project.filePaths) {
        console.log('❌ No filePaths found');
        return [];
    }

    // Handle null, undefined, empty string cases
    if (project.filePaths === null ||
        project.filePaths === undefined ||
        project.filePaths === '' ||
        project.filePaths === 'null' ||
        project.filePaths === '[]') {
        console.log('❌ FilePaths is null/empty');
        return [];
    }

    try {
        let files;

        if (typeof project.filePaths === 'string') {
            console.log('- Parsing JSON string:', project.filePaths);
            files = JSON.parse(project.filePaths);
        } else if (Array.isArray(project.filePaths)) {
            console.log('- Already an array');
            files = project.filePaths;
        } else {
            console.log('❌ Invalid filePaths format');
            return [];
        }

        if (!Array.isArray(files)) {
            console.log('❌ Parsed result is not an array:', files);
            return [];
        }

        // Filter out invalid file paths
        const validFiles = files.filter(file =>
            file &&
            typeof file === 'string' &&
            file.trim() !== '' &&
            file.startsWith('/uploads/')
        );

        console.log('✅ Valid files found:', validFiles.length, validFiles);
        return validFiles;

    } catch (e) {
        console.error('❌ JSON parse error:', e);
        console.error('- Problematic data:', project.filePaths);
        return [];
    }
}

// Helper function to generate file count information
function generateFileCountInfo(project) {
    const files = getProjectFiles(project);
    if (files.length === 0) return '';

    const images = files.filter(file => isImageFile(file)).length;
    const pdfs = files.filter(file => isPdfFile(file)).length;

    let fileInfo = [];
    if (images > 0) fileInfo.push(`${images} image${images > 1 ? 's' : ''}`);
    if (pdfs > 0) fileInfo.push(`${pdfs} PDF${pdfs > 1 ? 's' : ''}`);

    return `
        <div class="meta-item">
            <i class="fas fa-paperclip"></i>
            <span>${fileInfo.join(', ')}</span>
        </div>
    `;
}

// Helper function to generate file actions button
function generateFileActionsButton(project) {
    const files = getProjectFiles(project);
    if (files.length === 0) return '';

    return `<button class="card-btn files" onclick="viewProjectFiles(${project.id})" title="View Files"><i class="fas fa-folder-open"></i></button>`;
}

// Helper functions to check file types
function isImageFile(filePath) {
    if (!filePath) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
}

function isPdfFile(filePath) {
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('.pdf');
}

// Helper function to extract original filename from stored path
function getOriginalFileName(filePath) {
    if (!filePath) return 'Unknown File';

    // Extract filename from path
    const fileName = filePath.split('/').pop();

    // Check if it's our generated format: originalName_timestamp_uniqueId.ext
    // Pattern: something_20231215_143022_123456789.ext
    const timestampPattern = /_\d{8}_\d{6}_\d+/;

    if (timestampPattern.test(fileName)) {
        // Remove the timestamp and unique ID to get original name
        const parts = fileName.split('_');
        if (parts.length >= 4) {
            // Remove last 3 parts (timestamp_time_uniqueId) and reconstruct
            const originalParts = parts.slice(0, -3);
            let originalName = originalParts.join('_');

            // Add back the extension
            const lastPart = parts[parts.length - 1]; // This has extension
            const extension = lastPart.includes('.') ? lastPart.substring(lastPart.lastIndexOf('.')) : '';
            originalName += extension;

            return originalName;
        }
    }

    // If pattern doesn't match, return the filename as is
    return fileName;
}

// Helper function to get display name with size limit
function getDisplayFileName(filePath, maxLength = 25) {
    const originalName = getOriginalFileName(filePath);

    if (originalName.length <= maxLength) {
        return originalName;
    }

    // Truncate long filenames intelligently
    const extension = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));

    const availableLength = maxLength - extension.length - 3; // 3 for "..."
    const truncatedName = nameWithoutExt.substring(0, availableLength) + '...';

    return truncatedName + extension;
}

// Function to view project files
function viewProjectFiles(projectId) {
    const project = projects.find(p => p.id === projectId);
    const files = getProjectFiles(project);

    if (!project || files.length === 0) {
        showToast('No files found for this project', 'info');
        return;
    }

    showProjectFilesModal(project);
}

// Function to show project files modal
function showProjectFilesModal(project) {
    const files = getProjectFiles(project);
    const images = files.filter(file => isImageFile(file));
    const pdfs = files.filter(file => isPdfFile(file));

    const modalHTML = `
        <div class="modal active" id="projectFilesModal" onclick="if(event.target === this) closeModal('projectFilesModal')">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2><i class="fas fa-folder-open"></i> Project Files - ${project.name}</h2>
                    <button class="close-btn" onclick="closeModal('projectFilesModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${images.length > 0 ? `
                        <div class="files-section">
                            <h3><i class="fas fa-images"></i> Images (${images.length})</h3>
                            <div class="file-gallery">
                                ${images.map(img => `
                                    <div class="gallery-item">
                                        <img src="${img}" alt="Project Image" onclick="openImageModal('${img}')">
                                        <div class="gallery-actions">
                                            <button onclick="downloadFile('${img}')" title="Download">
                                                <i class="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${pdfs.length > 0 ? `
                        <div class="files-section">
                            <h3><i class="fas fa-file-pdf"></i> PDFs (${pdfs.length})</h3>
                            <div class="pdf-list">
                                ${pdfs.map(pdf => `
                                    <div class="pdf-item">
                                        <div class="pdf-info">
                                            <i class="fas fa-file-pdf"></i>
                                            <span>${pdf.split('/').pop()}</span>
                                        </div>
                                        <div class="pdf-actions">
                                            <button onclick="openPdf('${pdf}')" title="View PDF">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="downloadFile('${pdf}')" title="Download">
                                                <i class="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('projectFilesModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Function to open image in modal with error handling
function openImageModal(imageSrc) {
    const imageModalHTML = `
        <div class="modal active" id="imageModal" onclick="if(event.target === this) closeModal('imageModal')">
            <div class="modal-content" style="max-width: 90vw; max-height: 90vh; padding: 20px;">
                <div class="modal-header">
                    <h2><i class="fas fa-image"></i> Image View</h2>
                    <button class="close-btn" onclick="closeModal('imageModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <div id="imageLoadingArea">
                        <div style="margin-bottom: 20px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i>
                            <p>Loading image...</p>
                        </div>
                        <img id="modalImage" src="${imageSrc}" alt="Project Image" 
                             style="max-width: 100%; max-height: 70vh; object-fit: contain; display: none;"
                             onload="this.style.display='block'; this.parentElement.querySelector('div').style.display='none';"
                             onerror="handleImageError(this, '${imageSrc}')">
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingImageModal = document.getElementById('imageModal');
    if (existingImageModal) {
        existingImageModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', imageModalHTML);
}

// Handle image loading errors
function handleImageError(img, originalSrc) {
    const loadingArea = document.getElementById('imageLoadingArea');
    if (loadingArea) {
        loadingArea.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #6b7280;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; color: #f59e0b;"></i>
                <h3>Image temporarily unavailable</h3>
                <p>The image is being processed. Please try again in a moment.</p>
                <button onclick="retryImageLoad('${originalSrc}')" 
                        style="margin-top: 15px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

// Retry image loading
function retryImageLoad(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    const loadingArea = document.getElementById('imageLoadingArea');

    if (modalImage && loadingArea) {
        loadingArea.innerHTML = `
            <div style="margin-bottom: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i>
                <p>Retrying image load...</p>
            </div>
        `;

        modalImage.style.display = 'none';
        modalImage.src = imageSrc + '?t=' + Date.now(); // Add cache buster
    }
}

// Function to open PDF with error handling
function openPdf(pdfSrc) {
    // Verify PDF accessibility first
    fetch(pdfSrc, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                window.open(pdfSrc, '_blank');
            } else {
                throw new Error('PDF not immediately accessible');
            }
        })
        .catch(error => {
            console.warn('PDF access issue:', error);
            showToast('PDF is being processed. Opening in new tab...', 'info');

            // Try opening anyway after a short delay
            setTimeout(() => {
                window.open(pdfSrc, '_blank');
            }, 1500);
        });
}

// Function to download file with original filename and error handling
function downloadFile(fileSrc) {
    // First, verify file is accessible
    fetch(fileSrc, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                // File is accessible, proceed with download
                const link = document.createElement('a');
                link.href = fileSrc;
                link.download = getOriginalFileName(fileSrc);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast(`Download started: ${getOriginalFileName(fileSrc)}`, 'success');
            } else {
                throw new Error('File not immediately accessible');
            }
        })
        .catch(error => {
            console.warn('File access issue:', error);
            showToast(`File is being processed. Please try again in a moment.`, 'warning');

            // Attempt download anyway (might work even if HEAD request failed)
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = fileSrc;
                link.download = getOriginalFileName(fileSrc);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 1000);
        });
}

// Function to generate project files section for details modal
function generateProjectFilesSection(project) {
    console.log('🎨 GENERATE FILES SECTION - Starting for project:', project.id);

    const files = getProjectFiles(project);
    console.log('🎨 Files received from getProjectFiles:', files);
    console.log('🎨 File count:', files.length);

    if (files.length === 0) {
        console.log('🎨 ZERO FILES - Generating empty state');
        return `
            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-paperclip" style="color: #6b7280; font-size: 1.2rem;"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #374151; font-size: 1.1rem;">Project Files</h4>
                        <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 0.85rem;">Attached Documents</p>
                    </div>
                </div>
                <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; color: #d1d5db; margin-bottom: 15px;"></i>
                    <p style="color: #6b7280; font-size: 1rem; margin: 0;">No files attached to this project</p>
                </div>
            </div>
        `;
    }

    console.log('🎨 FILES FOUND - Generating file display for', files.length, 'files');

    console.log('📝 Categorizing files...');
    const images = files.filter(file => isImageFile(file));
    const pdfs = files.filter(file => isPdfFile(file));
    const others = files.filter(file => !isImageFile(file) && !isPdfFile(file));

    console.log('📝 File categorization results:');
    console.log('- Images:', images.length, images);
    console.log('- PDFs:', pdfs.length, pdfs);
    console.log('- Others:', others.length, others);

    return `
        <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <div style="width: 40px; height: 40px; background: #ede9fe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-paperclip" style="color: #7c3aed; font-size: 1.2rem;"></i>
                </div>
                <div>
                    <h4 style="margin: 0; color: #374151; font-size: 1.1rem;">Project Files</h4>
                    <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 0.85rem;">${files.length} file${files.length !== 1 ? 's' : ''} attached</p>
                </div>
            </div>
            <div style="background: #f8fafc; border-radius: 10px; padding: 20px;">
                
                ${images.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                        <h4 style="color: #374151; margin-bottom: 10px; font-size: 0.9rem;">
                            <i class="fas fa-images" style="color: #10b981;"></i> 
                            Images (${images.length})
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">
                            ${images.map(img => `
                                <div style="background: white; border-radius: 6px; padding: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="width: 100%; height: 60px; background: #e5e7eb; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <img src="${img}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: cover; border-radius: 4px;" 
                                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                        <div style="display: none; color: #6b7280;">
                                            <i class="fas fa-image"></i>
                                        </div>
                                    </div>
                                    <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 8px; word-break: break-all;" title="${getOriginalFileName(img)}">
                                        ${getDisplayFileName(img, 15)}
                                    </div>
                                    <div style="display: flex; gap: 4px; justify-content: center;">
                                        <button onclick="openImageModal('${img}')" 
                                                style="padding: 4px 8px; background: var(--primary-color); color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer;"
                                                title="View Image">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="downloadFile('${img}')" 
                                                style="padding: 4px 8px; background: var(--success-color); color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer;"
                                                title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${pdfs.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                        <h4 style="color: #374151; margin-bottom: 10px; font-size: 0.9rem;">
                            <i class="fas fa-file-pdf" style="color: #ef4444;"></i> 
                            PDF Documents (${pdfs.length})
                        </h4>
                        <div style="display: grid; gap: 8px;">
                            ${pdfs.map(pdf => `
                                <div style="background: white; border-radius: 6px; padding: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                        <div style="width: 40px; height: 40px; background: #fee2e2; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-file-pdf" style="color: #ef4444; font-size: 1.2rem;"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight: 600; color: #374151; font-size: 0.85rem;" title="${getOriginalFileName(pdf)}">
                                                ${getDisplayFileName(pdf, 30)}
                                            </div>
                                            <div style="font-size: 0.75rem; color: #6b7280;">PDF Document</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button onclick="openPdf('${pdf}')" 
                                                style="padding: 6px 12px; background: var(--primary-color); color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer;"
                                                title="View PDF">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button onclick="downloadFile('${pdf}')" 
                                                style="padding: 6px 12px; background: var(--success-color); color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer;"
                                                title="Download PDF">
                                            <i class="fas fa-download"></i> Download
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${others.length > 0 ? `
                    <div>
                        <h4 style="color: #374151; margin-bottom: 10px; font-size: 0.9rem;">
                            <i class="fas fa-file" style="color: #6b7280;"></i> 
                            Other Files (${others.length})
                        </h4>
                        <div style="display: grid; gap: 6px;">
                            ${others.map(file => `
                                <div style="background: white; border-radius: 6px; padding: 10px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                        <i class="fas fa-file" style="color: #6b7280;"></i>
                                        <span style="color: #374151; font-size: 0.85rem;" title="${getOriginalFileName(file)}">${getDisplayFileName(file, 35)}</span>
                                    </div>
                                    <button onclick="downloadFile('${file}')" 
                                            style="padding: 4px 8px; background: var(--success-color); color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer;"
                                            title="Download">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
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
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 20px; background: #f8fafc;">
                    
                    <!-- PROJECT HEADER CARD -->
                    <div style="background: linear-gradient(135deg, var(--primary-color), var(--info-color)); padding: 25px; border-radius: 12px; margin-bottom: 20px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.5rem; font-weight: 700;">${project.name}</h3>
                                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 1rem;">Client: ${project.clientName || 'Not specified'}</p>
                            </div>
                            <div style="text-align: right;">
                                <span class="status-badge" style="background: rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                                    ${project.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <span style="opacity: 0.9; font-size: 0.9rem;">Progress:</span>
                                    <span style="font-weight: 600;">${project.progress || 0}%</span>
                                </div>
                                <div style="height: 10px; background: rgba(255,255,255,0.3); border-radius: 10px; overflow: hidden;">
                                    <div style="height: 100%; background: rgba(255,255,255,0.8); width: ${project.progress || 0}%; transition: width 0.3s ease; border-radius: 10px;"></div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 2px;">Project ID</div>
                                <div style="font-family: monospace; font-weight: 600; font-size: 1.1rem;">#${project.id}</div>
                            </div>
                        </div>
                    </div>

                    <!-- PROJECT DETAILS GRID -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        
                        <!-- FINANCIAL INFO CARD -->
                        <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                                <div style="width: 40px; height: 40px; background: #fee2e2; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-rupee-sign" style="color: #ef4444; font-size: 1.2rem;"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; color: #374151; font-size: 1rem;">Budget</h4>
                                    <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 0.85rem;">Project Budget</p>
                                </div>
                            </div>
                            <div style="font-size: 1.8rem; font-weight: 700; color: #374151;">₹${project.budget ? project.budget.toLocaleString() : '0'}</div>
                        </div>

                        <!-- CATEGORY INFO CARD -->
                        <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                                <div style="width: 40px; height: 40px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-tag" style="color: #3b82f6; font-size: 1.2rem;"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; color: #374151; font-size: 1rem;">Category</h4>
                                    <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 0.85rem;">Project Type</p>
                                </div>
                            </div>
                            <div style="font-size: 1.2rem; font-weight: 600; color: #374151;">${project.category || 'Not specified'}</div>
                        </div>
                    </div>

                    <!-- PROJECT TIMELINE CARD -->
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                            <div style="width: 40px; height: 40px; background: #ecfdf5; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-calendar-alt" style="color: #10b981; font-size: 1.2rem;"></i>
                            </div>
                            <div>
                                <h4 style="margin: 0; color: #374151; font-size: 1.1rem;">Project Timeline</h4>
                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 0.85rem;">Start and End Dates</p>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center;">
                            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                                <div style="color: #6b7280; font-size: 0.8rem; margin-bottom: 5px;">START DATE</div>
                                <div style="color: #374151; font-weight: 600; font-size: 1rem;">${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</div>
                            </div>
                            <div style="width: 40px; height: 2px; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: 1px; position: relative;">
                                <div style="position: absolute; right: -8px; top: -6px; width: 0; height: 0; border-left: 8px solid #3b82f6; border-top: 6px solid transparent; border-bottom: 6px solid transparent;"></div>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                                <div style="color: #6b7280; font-size: 0.8rem; margin-bottom: 5px;">END DATE</div>
                                <div style="color: #374151; font-weight: 600; font-size: 1rem;">${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- DESCRIPTION CARD -->
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <div style="width: 40px; height: 40px; background: #fef3c7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-file-alt" style="color: #f59e0b; font-size: 1.2rem;"></i>
                            </div>
                            <div>
                                <h4 style="margin: 0; color: #374151; font-size: 1.1rem;">Project Description</h4>
                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 0.85rem;">Detailed Information</p>
                            </div>
                        </div>
                        <div style="color: #374151; line-height: 1.6; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                            ${project.description || 'No description available'}
                        </div>
                    </div>

                    <!-- PROJECT FILES CARD -->
                    ${generateProjectFilesSection(project)}

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
    const categorySelect = form.querySelector('select[name="category"]');
    const statusSelect = form.querySelector('select[name="status"]');
    const startDateInput = form.querySelector('input[name="startDate"]');
    const endDateInput = form.querySelector('input[name="endDate"]');
    const budgetInput = form.querySelector('input[name="budget"]');
    const progressInput = form.querySelector('input[name="progress"]');

    // Fill basic fields
    if (nameInput) nameInput.value = project.name || '';
    if (clientNameInput) clientNameInput.value = project.clientName || '';
    if (descriptionInput) descriptionInput.value = project.description || '';

    // Fill additional fields
    if (budgetInput) budgetInput.value = project.budget || '';
    if (progressInput) progressInput.value = project.progress || '';

    // Fill date fields (convert from datetime to date format)
    if (startDateInput && project.startDate) {
        const startDate = new Date(project.startDate);
        startDateInput.value = startDate.toISOString().split('T')[0];
    }
    if (endDateInput && project.endDate) {
        const endDate = new Date(project.endDate);
        endDateInput.value = endDate.toISOString().split('T')[0];
    }

    // Set category select
    if (categorySelect && project.category) {
        Array.from(categorySelect.options).forEach(option => {
            if (option.value === project.category) {
                option.selected = true;
            }
        });
    }

    // Set status select
    if (statusSelect) {
        Array.from(statusSelect.options).forEach(option => {
            if (option.value.toUpperCase() === (project.status || 'PENDING').toUpperCase()) {
                option.selected = true;
            }
        });
    }

    // Display existing files in edit mode
    displayExistingFilesInEditMode(project);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Project';
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
    const categorySelect = form.querySelector('select[name="category"]');
    const statusSelect = form.querySelector('select[name="status"]');
    const startDateInput = form.querySelector('input[name="startDate"]');
    const endDateInput = form.querySelector('input[name="endDate"]');
    const budgetInput = form.querySelector('input[name="budget"]');
    const progressInput = form.querySelector('input[name="progress"]');

    if (!nameInput || !clientNameInput || !statusSelect) {
        showToast('Form fields not found. Please refresh the page.', 'error');
        return;
    }

    // Validate required fields
    if (!nameInput.value.trim() || !clientNameInput.value.trim() || !statusSelect.value) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    // Comprehensive validation for file upload status
    if (window.uploadedFiles && window.uploadedFiles.length > 0) {
        const failedUploads = window.uploadedFiles.filter(f => f.uploadStatus === 'failed');
        const uploadingFiles = window.uploadedFiles.filter(f => f.uploadStatus === 'uploading');
        const pendingUploads = window.uploadedFiles.filter(f => f.uploadStatus === 'pending');
        const completedUploads = window.uploadedFiles.filter(f => f.uploadStatus === 'completed');

        // Calculate overall progress
        const totalProgress = window.uploadedFiles.reduce((sum, file) => sum + (file.uploadProgress || 0), 0);
        const averageProgress = Math.round(totalProgress / window.uploadedFiles.length);

        if (uploadingFiles.length > 0 || pendingUploads.length > 0) {
            showToast(`⏳ Please wait: ${uploadingFiles.length + pendingUploads.length} file(s) are still uploading (${averageProgress}% complete)...`, 'warning');
            return;
        }

        if (failedUploads.length > 0) {
            const failedNames = failedUploads.map(f => f.name).join(', ');
            showToast(`❌ Cannot create project: ${failedUploads.length} file(s) failed to upload (${failedNames}). Please retry failed uploads or remove them.`, 'error');
            return;
        }

        if (completedUploads.length === 0) {
            showToast(`⚠️ No files have been successfully uploaded. Please upload at least one file or proceed without files.`, 'warning');
            return;
        }

        console.log(`✅ All uploads complete: ${completedUploads.length} files ready for project creation`);
    }

    try {
        // Comprehensive file upload status validation
        let uploadedFilePaths = [];
        if (window.uploadedFiles && window.uploadedFiles.length > 0) {
            console.log('📁 Validating upload status for', window.uploadedFiles.length, 'files...');

            // Categorize files by status
            const successfulUploads = window.uploadedFiles.filter(f => f.uploadStatus === 'completed' && f.uploadedPath);
            const failedUploads = window.uploadedFiles.filter(f => f.uploadStatus === 'failed');
            const uploadingFiles = window.uploadedFiles.filter(f => f.uploadStatus === 'uploading');
            const pendingUploads = window.uploadedFiles.filter(f => f.uploadStatus === 'pending');

            // Calculate progress statistics
            const totalProgress = window.uploadedFiles.reduce((sum, file) => sum + (file.uploadProgress || 0), 0);
            const averageProgress = Math.round(totalProgress / window.uploadedFiles.length);

            console.log('📊 Upload Statistics:');
            console.log('- Completed:', successfulUploads.length);
            console.log('- Failed:', failedUploads.length);
            console.log('- Uploading:', uploadingFiles.length);
            console.log('- Pending:', pendingUploads.length);
            console.log('- Average Progress:', averageProgress + '%');

            // Block submission if uploads are incomplete
            if (uploadingFiles.length > 0 || pendingUploads.length > 0) {
                const activeUploads = uploadingFiles.length + pendingUploads.length;
                showToast(`⏳ Upload in progress: ${activeUploads} file(s) uploading (${averageProgress}% complete). Please wait...`, 'warning');
                return;
            }

            if (failedUploads.length > 0) {
                const failedNames = failedUploads.map(f => f.name).join(', ');
                showToast(`❌ Upload errors detected: ${failedUploads.length} file(s) failed (${failedNames}). Please retry or remove failed uploads.`, 'error');
                return;
            }

            // Use successfully uploaded files
            uploadedFilePaths = successfulUploads.map(f => f.uploadedPath);
            console.log('✅ All files uploaded successfully:', uploadedFilePaths);
            showToast(`🚀 Creating project with ${uploadedFilePaths.length} successfully uploaded file(s)...`, 'info');
        } else {
            console.log('ℹ️ No files attached to this project');
        }

        // Prepare project data
        const projectData = {
            name: nameInput.value.trim(),
            clientName: clientNameInput.value.trim(),
            description: descriptionInput ? descriptionInput.value.trim() : '',
            category: categorySelect ? categorySelect.value : '',
            status: statusSelect.value.toUpperCase(),
            startDate: startDateInput && startDateInput.value ? startDateInput.value + 'T00:00:00' : null,
            endDate: endDateInput && endDateInput.value ? endDateInput.value + 'T23:59:59' : null,
            budget: budgetInput ? parseFloat(budgetInput.value) || 0 : 0,
            progress: progressInput ? parseInt(progressInput.value) || 0 : 0,
            filePaths: uploadedFilePaths.length > 0 ? JSON.stringify(uploadedFilePaths) : null,
            imageUrl: uploadedFilePaths.length > 0 ? uploadedFilePaths[0] : null // Use first file as main image
        };

        console.log('🚨 CRITICAL - Project data preparation:');
        console.log('- Files array received from upload:', uploadedFilePaths);
        console.log('- Files array length:', uploadedFilePaths.length);
        console.log('- JSON string created:', projectData.filePaths);
        console.log('- JSON string length:', projectData.filePaths ? projectData.filePaths.length : 0);
        console.log('- Full project data being sent:', JSON.stringify(projectData, null, 2));

        if (currentEditId) {
            // Update existing project
            const updatedProject = await apiCall(`/api/admin/projects/${currentEditId}`, 'PUT', projectData);
            console.log('✅ Project updated - response:', updatedProject);
            console.log('- Updated project filePaths:', updatedProject.filePaths);
            const index = projects.findIndex(p => p.id === currentEditId);
            if (index !== -1) {
                projects[index] = updatedProject;
            }
            showToast('Project updated successfully', 'success');
        } else {
            // Create new project
            const newProject = await apiCall('/api/admin/projects/create', 'POST', projectData);
            console.log('🚨 CRITICAL - Project creation response:');
            console.log('- Full response object:', JSON.stringify(newProject, null, 2));
            console.log('- Response filePaths field:', newProject.filePaths);
            console.log('- Response filePaths type:', typeof newProject.filePaths);
            console.log('- Response filePaths length:', newProject.filePaths ? newProject.filePaths.length : 0);

            projects.push(newProject);
            showToast('Project created successfully', 'success');
        }

        // Refresh projects list to ensure we get the latest data from database
        await loadProjects();

        filteredProjects = [...projects];
        updateStats();
        renderProjects();
        closeModal('projectModal');
    } catch (error) {
        console.error('Error saving project:', error);
        let errorMessage = 'Failed to save project. Please try again.';

        if (error.message) {
            errorMessage += ' Error: ' + error.message;
        }

        showToast(errorMessage, 'error');
    }
}



// ============================================
// FILE UPLOAD HANDLING
// ============================================

async function uploadProjectFiles() {
    console.log('🚨 UPLOAD FUNCTION CALLED - uploadProjectFiles()');
    console.log('- window.uploadedFiles exists?', !!window.uploadedFiles);
    console.log('- window.uploadedFiles value:', window.uploadedFiles);

    if (!window.uploadedFiles || window.uploadedFiles.length === 0) {
        console.log('❌ CRITICAL: No files to upload');
        console.log('  - uploadedFiles is:', window.uploadedFiles);
        console.log('  - uploadedFiles length:', window.uploadedFiles ? window.uploadedFiles.length : 'N/A');
        return [];
    }

    console.log('🚨 STARTING FILE UPLOAD PROCESS');
    console.log('- Files to upload count:', window.uploadedFiles.length);
    console.log('- Files array:', window.uploadedFiles);

    const formData = new FormData();
    window.uploadedFiles.forEach((fileObj, index) => {
        console.log(`📎 Adding file ${index + 1}:`, fileObj.name, '(', fileObj.file.size, 'bytes)');
        formData.append('files', fileObj.file);  // Remove backticks around files
    });

    // Log FormData contents
    console.log('📋 FormData prepared, entries:');
    for (let pair of formData.entries()) {
        console.log('  - Key:', pair[0], 'Value type:', typeof pair[1], 'Name:', pair[1].name || 'N/A');
    }

    try {
        console.log('🚨 MAKING FETCH REQUEST to /api/admin/projects/upload-files');
        console.log('- Method: POST');
        console.log('- Body: FormData with', window.uploadedFiles.length, 'files');

        const response = await fetch('/api/admin/projects/upload-files', {
            method: 'POST',
            body: formData,
        });

        console.log('📨 RESPONSE RECEIVED:');
        console.log('- Status:', response.status);
        console.log('- Status text:', response.statusText);
        console.log('- OK:', response.ok);
        console.log('- Headers:', [...response.headers.entries()]);

        if (response.ok) {
            console.log('✅ Response OK - parsing JSON...');
            const result = await response.json();
            console.log('📦 PARSED RESPONSE:', JSON.stringify(result, null, 2));

            if (result.success) {
                console.log('🎉 SUCCESS CONFIRMED!');
                console.log('- Message:', result.message);
                console.log('- File paths returned:', result.filePaths);
                console.log('- Number of paths:', result.filePaths ? result.filePaths.length : 0);

                showToast(result.message || `${window.uploadedFiles.length} file(s) uploaded successfully`, 'success');
                return result.filePaths || [];
            } else {
                console.error('❌ UPLOAD FAILED - Backend returned success=false');
                console.error('- Error message:', result.message);
                throw new Error(result.message || 'Upload failed');
            }
        } else {
            console.error('❌ HTTP ERROR RESPONSE');
            const errorText = await response.text();
            console.error('- Status:', response.status);
            console.error('- Error text:', errorText);
            throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('💥 CATCH BLOCK - Upload error:', error);
        console.error('- Error name:', error.name);
        console.error('- Error message:', error.message);
        console.error('- Error stack:', error.stack);

        showToast('Failed to upload files. Saving project without files.', 'warning');
        return [];
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
// EXISTING FILES MANAGEMENT
// ============================================

// Display existing files in edit mode with delete functionality
function displayExistingFilesInEditMode(project) {
    console.log('📂 Displaying existing files for project:', project.id);

    const existingFiles = getProjectFiles(project);
    console.log('- Found existing files:', existingFiles.length);

    if (existingFiles.length === 0) {
        return; // No existing files to display
    }

    // Create existing files section
    let existingFilesContainer = document.getElementById('existingFilesContainer');
    if (!existingFilesContainer) {
        const filePreview = document.getElementById('filePreview');
        if (filePreview && filePreview.parentNode) {
            existingFilesContainer = document.createElement('div');
            existingFilesContainer.id = 'existingFilesContainer';
            existingFilesContainer.style.cssText = 'margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;';

            const header = document.createElement('h4');
            header.style.cssText = 'margin: 0 0 15px 0; color: #374151; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;';
            header.innerHTML = '<i class="fas fa-paperclip"></i> Current Project Files';

            existingFilesContainer.appendChild(header);
            filePreview.parentNode.insertBefore(existingFilesContainer, filePreview);
        }
    } else {
        // Clear existing content except header
        const header = existingFilesContainer.querySelector('h4');
        existingFilesContainer.innerHTML = '';
        if (header) existingFilesContainer.appendChild(header);
    }

    // Display each existing file with delete option
    existingFiles.forEach(filePath => {
        const fileItem = createExistingFileItem(project.id, filePath);
        existingFilesContainer.appendChild(fileItem);
    });
}

// Create individual existing file item with delete functionality
function createExistingFileItem(projectId, filePath) {
    const fileName = getOriginalFileName(filePath);
    const isImage = isImageFile(filePath);
    const isPdf = isPdfFile(filePath);

    const fileItem = document.createElement('div');
    fileItem.className = 'existing-file-item';
    fileItem.setAttribute('data-file-path', filePath);
    fileItem.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px; margin-bottom: 8px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;';

    // File info section
    const fileInfo = document.createElement('div');
    fileInfo.style.cssText = 'display: flex; align-items: center; gap: 10px; flex: 1;';

    // File icon
    const fileIcon = document.createElement('div');
    fileIcon.style.cssText = 'width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;';

    if (isImage) {
        fileIcon.style.background = '#dbeafe';
        fileIcon.innerHTML = '<i class="fas fa-image" style="color: #3b82f6;"></i>';
    } else if (isPdf) {
        fileIcon.style.background = '#fee2e2';
        fileIcon.innerHTML = '<i class="fas fa-file-pdf" style="color: #ef4444;"></i>';
    } else {
        fileIcon.style.background = '#f3f4f6';
        fileIcon.innerHTML = '<i class="fas fa-file" style="color: #6b7280;"></i>';
    }

    // File details
    const fileDetails = document.createElement('div');
    fileDetails.innerHTML = `
        <div style="font-weight: 600; color: #374151; font-size: 0.85rem;">${fileName}</div>
        <div style="font-size: 0.75rem; color: #6b7280;">${isImage ? 'Image' : isPdf ? 'PDF Document' : 'File'}</div>
    `;

    fileInfo.appendChild(fileIcon);
    fileInfo.appendChild(fileDetails);

    // Action buttons
    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 6px;';

    // View button
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.style.cssText = 'padding: 6px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer;';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.title = 'View file';
    viewBtn.onclick = () => {
        if (isImage) {
            openImageModal(filePath);
        } else if (isPdf) {
            openPdf(filePath);
        } else {
            downloadFile(filePath);
        }
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.style.cssText = 'padding: 6px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer;';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete file';
    deleteBtn.onclick = () => deleteExistingFile(projectId, filePath, fileItem);

    actions.appendChild(viewBtn);
    actions.appendChild(deleteBtn);

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(actions);

    return fileItem;
}

// Delete existing file from project
async function deleteExistingFile(projectId, filePath, fileElement) {
    const fileName = getOriginalFileName(filePath);

    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        console.log('🗑️ Deleting file:', filePath, 'from project:', projectId);

        // Show deleting state
        const deleteBtn = fileElement.querySelector('button[title="Delete file"]');
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            deleteBtn.disabled = true;
        }

        // Call delete API
        const response = await fetch(`/api/admin/projects/delete-file?projectId=${projectId}&filePath=${encodeURIComponent(filePath)}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            // Remove from UI immediately
            fileElement.style.transition = 'opacity 0.3s ease';
            fileElement.style.opacity = '0';

            setTimeout(() => {
                fileElement.remove();

                // Check if no more existing files
                const container = document.getElementById('existingFilesContainer');
                const remainingFiles = container ? container.querySelectorAll('.existing-file-item').length : 0;
                if (remainingFiles === 0 && container) {
                    container.remove();
                }
            }, 300);

            // Update the project in memory
            const project = projects.find(p => p.id === projectId);
            if (project && result.updatedProject) {
                project.filePaths = result.updatedProject.filePaths;
                project.imageUrl = result.updatedProject.imageUrl;
            }

            showToast(`✅ File "${fileName}" deleted successfully`, 'success');
            console.log('✅ File deleted successfully:', result);

        } else {
            throw new Error(result.error || 'Failed to delete file');
        }

    } catch (error) {
        console.error('❌ File deletion failed:', error);

        // Restore delete button
        const deleteBtn = fileElement.querySelector('button[title="Delete file"]');
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.disabled = false;
        }

        showToast(`❌ Failed to delete "${fileName}": ${error.message}`, 'error');
    }
}

// Clear existing files display when modal is closed
function clearExistingFilesDisplay() {
    const container = document.getElementById('existingFilesContainer');
    if (container) {
        container.remove();
    }
}

// ============================================
// DEBUG FUNCTIONS
// ============================================

// Debug function to test file parsing - call this from browser console
window.debugProjectFiles = function(projectId) {
    console.log('🧪 MANUAL DEBUG - Testing project files for ID:', projectId);

    const project = projects.find(p => p.id === parseInt(projectId));
    if (!project) {
        console.error('❌ Project not found with ID:', projectId);
        console.log('Available projects:', projects.map(p => ({ id: p.id, name: p.name })));
        return null;
    }

    console.log('🔍 Testing getProjectFiles function...');
    const files = getProjectFiles(project);

    console.log('🧪 DEBUG RESULTS:');
    console.log('- Project:', project.name);
    console.log('- Raw filePaths:', project.filePaths);
    console.log('- Parsed files:', files);
    console.log('- File count:', files.length);

    if (files.length > 0) {
        console.log('✅ Files found! Testing generateProjectFilesSection...');
        const html = generateProjectFilesSection(project);
        console.log('- Generated HTML length:', html.length);
        console.log('- HTML preview:', html.substring(0, 500));
    }

    return { project, files, fileCount: files.length };
};

// Test function to manually add test files to a project (for debugging)
window.addTestFilesToProject = function(projectId) {
    console.log('🧪 Adding test files to project:', projectId);

    const project = projects.find(p => p.id === parseInt(projectId));
    if (!project) {
        console.error('❌ Project not found');
        return;
    }

    const testFiles = [
        '/uploads/projects/test_image.jpg',
        '/uploads/projects/test_document.pdf'
    ];

    project.filePaths = JSON.stringify(testFiles);
    console.log('✅ Test files added:', testFiles);
    console.log('- Updated project filePaths:', project.filePaths);

    // Re-render the projects to see the change
    renderProjects();

    return project;
};

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


