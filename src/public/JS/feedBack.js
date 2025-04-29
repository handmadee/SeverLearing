import { createToastV, eToast } from "./Aleart.js";
import { LOCALHOST_API_URL } from "./config.js";

// Constants
const API_ENDPOINTS = {
    BASE_URL: LOCALHOST_API_URL,
    FEEDBACK: {
        ALL: 'feedback',
        BY_ID: (id) => `feedback/find-id/${id}`,
        BY_TEACHER: (id) => `feedbackByTeacher/${id}`,
        BY_MONTH: (month) => `feedbackByMonth?month=${month}`,
        BY_TEACHER_AND_MONTH: (id, month) => `feedback/teacher/${id}?month=${month}`,
        EXPORT_EXCEL: (month) => `feedback/export-feedback/?month=${month}`,
        DELETE_BULK: 'delete-bulk/feedback'
    }
};
const BADGE_CLASSES = {
    good: 'badge-good',
    rather: 'badge-rather',
    medium: 'badge-medium'
};

// Global state management
const state = {
    isLoading: false,
    currentView: {
        teacherId: 'all',
        month: new Date().getMonth() + 1
    },
    selection: {
        items: [],
        all: false
    },
    editing: {
        id: null,
        data: null
    }
};

// Notification throttling system
const notificationManager = {
    queue: [],
    isProcessing: false,
    throttleTime: 2000, // 2 seconds between notifications

    // Add a notification to the queue
    add(type, message) {
        this.queue.push({ type, message });
        if (!this.isProcessing) this.processQueue();
    },

    // Process notifications one at a time
    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { type, message } = this.queue.shift();
        createToastV(type, message);

        await new Promise(resolve => setTimeout(resolve, this.throttleTime));
        this.processQueue();
    }
};

// Helper to show notifications at controlled rate
function showNotification(type, message) {
    notificationManager.add(type, message);
}

let domManager;
let apiService;
let feedbackManager;

class DOMManager {
    constructor() {
        this.elements = this.cacheDOM();
        this.initVirtualDOM();
        this.bindEvents();
    }

    cacheDOM() {
        // Cache all DOM elements for better performance
        return {
            selectTeacher: document.getElementById("teacher"),
            selectTime: document.getElementById("time"),
            contentTable: document.getElementById("contentTable"),
            dialogReview: document.getElementById("dialogReview"),
            nameStudents: document.querySelector(".nameStudents"),
            phoneStudents: document.querySelector(".phoneStudents"),
            tableLanguages: document.getElementById("tableLanguages"),
            btnCloseDialog: document.getElementById("btnCloseDialog"),
            btnSubmitFeedback: document.getElementById("btnSubmitFeedback"),
            searchStudent: document.getElementById("searchStudent"),
            radioProgramming: document.querySelectorAll('input[name="programming-skill"]'),
            radioThinking: document.querySelectorAll('input[name="thinking-skill"]'),
            selectFile: document.getElementById("fileInput"),
            importFile: document.getElementById("importButton"),
            exportFile: document.getElementById("exportButton"),
            selectAll: document.getElementById('selectAll'),
            bulkActions: document.querySelector('.bulk-actions') || this.createBulkActionsContainer(),
            refreshBtn: document.getElementById('refreshButton') || this.createRefreshButton(),
            loadingOverlay: document.getElementById('loadingOverlay') || this.createLoadingOverlay()
        };
    }

    // Virtual DOM for table rendering - improves performance dramatically
    initVirtualDOM() {
        this.virtualTable = document.createDocumentFragment();
        this.rowTemplate = document.createElement('template');
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-text">Loading...</p>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    createRefreshButton() {
        const refreshButton = document.createElement('button');
        refreshButton.id = 'refreshButton';
        refreshButton.className = 'btn btn-outline-primary refresh-btn';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';

        // Find appropriate place to insert
        const exportBtn = document.getElementById('exportButton');
        if (exportBtn && exportBtn.parentNode) {
            exportBtn.parentNode.insertBefore(refreshButton, exportBtn.nextSibling);
        } else {
            // Fallback - add to document body, better than nothing
            document.body.appendChild(refreshButton);
        }

        return refreshButton;
    }

    createBulkActionsContainer() {
        const bulkActions = document.createElement('div');
        bulkActions.className = 'bulk-actions';
        bulkActions.innerHTML = `
            <span class="selected-count">0 selected</span>
            <button class="btn" id="bulkExport">Export Selected</button>
            <button class="btn" style="background-color: #dc3545" id="bulkDelete">Delete Selected</button>
        `;
        document.body.appendChild(bulkActions);
        return bulkActions;
    }

    bindEvents() {
        // Delegate events for better performance
        this.bindDialogEvents();
        this.bindFilterEvents();
        this.bindTableEvents();
        this.bindActionButtonEvents();

        // Add debounce to search for performance
        this.elements.searchStudent.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
    }

    bindDialogEvents() {
        this.elements.btnCloseDialog.addEventListener('click', () => {
            this.closeDialog();
            feedbackManager.resetEditingState();
        });

        // Close dialog on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.dialogReview.style.display === 'block') {
                this.closeDialog();
                feedbackManager.resetEditingState();
            }
        });

        // Close dialog when clicking outside
        this.elements.dialogReview.addEventListener('click', (e) => {
            if (e.target === this.elements.dialogReview) {
                this.closeDialog();
                feedbackManager.resetEditingState();
            }
        });
    }

    bindFilterEvents() {
        const { selectTeacher, selectTime } = this.elements;

        selectTeacher.addEventListener('change', () => {
            state.currentView.teacherId = selectTeacher.value;
            feedbackManager.renderFeedback();
        });

        selectTime.addEventListener('change', () => {
            state.currentView.month = selectTime.value;
            feedbackManager.renderFeedback();
        });
    }

    bindTableEvents() {
        // Using event delegation for table interactions
        this.elements.contentTable.addEventListener('click', (e) => {
            const target = e.target;

            // Edit button
            if (target.classList.contains('editBtn') || target.closest('.editBtn')) {
                const button = target.closest('.editBtn') || target;
                feedbackManager.handleEdit(button.dataset.id);
            }

            // Delete button
            if (target.classList.contains('deleteBtn') || target.closest('.deleteBtn')) {
                const button = target.closest('.deleteBtn') || target;
                feedbackManager.handleDelete(button.dataset.id);
            }

            // Copy icon
            if (target.classList.contains('copy-icon')) {
                this.handleCopyLink(target);
            }
        });

        // Handle checkbox delegation
        this.elements.contentTable.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-checkbox')) {
                feedbackManager.handleItemSelection(e);
            }
        });

        // Select all handler
        this.elements.selectAll.addEventListener('change', (e) => {
            feedbackManager.handleSelectAll(e);
        });
    }

    bindActionButtonEvents() {
        const { btnSubmitFeedback, importFile, exportFile, refreshBtn } = this.elements;

        btnSubmitFeedback.addEventListener('click', () => feedbackManager.handleSubmit());
        importFile.addEventListener('click', () => feedbackManager.createFileFeedBack());
        exportFile.addEventListener('click', () => feedbackManager.handleExport());
        refreshBtn.addEventListener('click', () => feedbackManager.refreshData());

        // Bulk delete action
        document.getElementById('bulkDelete')?.addEventListener('click',
            () => feedbackManager.handleBulkDelete());

        // Bulk export action (if implemented)
        document.getElementById('bulkExport')?.addEventListener('click',
            () => feedbackManager.handleBulkExport());
    }

    handleCopyLink(target) {
        const studentId = target.dataset.studentId;
        if (!studentId) return;

        const link = `${window.location.origin}/admin/parents/students/${studentId}`;

        // Use clipboard API with fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link)
                .then(() => {
                    // Visual feedback on the copy icon
                    target.classList.add('copied');
                    setTimeout(() => target.classList.remove('copied'), 1000);

                    showNotification(eToast.success, "Copied link to clipboard");
                })
                .catch(() => {
                    this.fallbackCopy(link);
                });
        } else {
            this.fallbackCopy(link);
        }
    }

    fallbackCopy(text) {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            showNotification(
                successful ? eToast.success : eToast.error,
                successful ? "Copied link to clipboard" : "Failed to copy link"
            );
        } catch (err) {
            showNotification(eToast.error, "Failed to copy link");
        }

        document.body.removeChild(textArea);
    }

    closeDialog() {
        // Use CSS animations for smoother transitions
        this.elements.dialogReview.classList.add('dialog-closing');
        setTimeout(() => {
            this.elements.dialogReview.style.display = "none";
            this.elements.dialogReview.classList.remove('dialog-closing');
        }, 300);
    }

    debounce(func, wait) {
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

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = this.elements.contentTable.querySelectorAll('tr');

        if (rows.length > 100) {
            // For large tables, use a more efficient approach
            this.handleLargeTableSearch(rows, searchTerm);
        } else {
            // For smaller tables, direct DOM manipulation is fine
            this.handleSmallTableSearch(rows, searchTerm);
        }
    }

    handleSmallTableSearch(rows, searchTerm) {
        // Using requestAnimationFrame for smoother UI
        requestAnimationFrame(() => {
            rows.forEach(row => {
                if (row.classList.contains('header-row')) return;

                const studentNameCell = row.querySelector('td:nth-child(2)');
                if (!studentNameCell) return;

                const studentName = studentNameCell.textContent.toLowerCase();
                row.style.display = studentName.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    handleLargeTableSearch(rows, searchTerm) {
        // For large tables, batch processing with multiple animation frames
        const batchSize = 50;
        let index = 0;

        const processRows = () => {
            const endIndex = Math.min(index + batchSize, rows.length);

            for (let i = index; i < endIndex; i++) {
                const row = rows[i];
                if (row.classList.contains('header-row')) continue;

                const studentNameCell = row.querySelector('td:nth-child(2)');
                if (!studentNameCell) continue;

                const studentName = studentNameCell.textContent.toLowerCase();
                row.style.display = studentName.includes(searchTerm) ? '' : 'none';
            }

            index = endIndex;

            if (index < rows.length) {
                requestAnimationFrame(processRows);
            }
        };

        requestAnimationFrame(processRows);
    }

    showLoading() {
        this.elements.loadingOverlay.classList.add('visible');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.remove('visible');
    }

    renderTableLoading() {
        this.elements.contentTable.innerHTML = `
            <tr>
                <td colspan="7" class="py-5 text-center">
                    <div class="skeleton-loader" style="height: 300px"></div>
                </td>
            </tr>
        `;
    }

    updateBulkActionsVisibility(count) {
        const { bulkActions } = this.elements;
        const countElem = bulkActions.querySelector('.selected-count');
        const bulkDeleteBtn = document.getElementById('bulkDelete');
        const bulkExportBtn = document.getElementById('bulkExport');

        if (!countElem || !bulkDeleteBtn) return;

        if (count > 0) {
            bulkActions.classList.add('visible');
            countElem.textContent = `${count} selected`;
            bulkDeleteBtn.disabled = false;
            bulkExportBtn && (bulkExportBtn.disabled = false);
        } else {
            bulkActions.classList.remove('visible');
            bulkDeleteBtn.disabled = true;
            bulkExportBtn && (bulkExportBtn.disabled = true);
        }
    }

    // Efficient table rendering using DocumentFragment and template
    renderTable(items = []) {
        // Clear previous content
        const table = this.elements.contentTable;
        table.innerHTML = '';

        if (items.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3">No feedback available at this time</td>
                </tr>
            `;
            return;
        }

        // Create batch renders for large data sets
        const fragment = document.createDocumentFragment();
        const batchSize = 50;
        let currentIndex = 0;

        const renderBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, items.length);

            for (let i = currentIndex; i < endIndex; i++) {
                const item = items[i];
                const row = document.createElement('tr');
                row.innerHTML = this.createRowHTML(item);
                fragment.appendChild(row);
            }

            // If we finished all items, append the fragment and stop
            if (endIndex >= items.length) {
                table.appendChild(fragment);
                return;
            }

            // Otherwise update our index and schedule the next batch
            currentIndex = endIndex;
            table.appendChild(fragment.cloneNode(true));
            requestAnimationFrame(renderBatch);
        };

        // Start batch rendering
        requestAnimationFrame(renderBatch);
    }

    createRowHTML(item) {
        const studentName = item?.studentsAccount?.fullname || '-';
        const teacherName = item?.teacherAccount?.username || '-';
        const studentId = item?.studentsAccount?._id || '';
        const skillBadge = feedbackManager.getBadgeClass(item?.skill);
        const thinkingBadge = feedbackManager.getBadgeClass(item?.thinking);
        const isSelected = state.selection.items.includes(item._id);

        return `
            <td class="checkbox-container">
                <input type="checkbox" class="item-checkbox" value="${item._id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td>
                <div class="student-cell">
                    ${studentName}
                    ${studentId ? `<i class="fas fa-copy copy-icon" data-student-id="${studentId}" title="Copy link"></i>` : ''}
                </div>
            </td>
            <td>${teacherName}</td>
            <td>
                <span class="badge ${skillBadge}">
                    ${item?.skill || '-'}
                </span>
            </td>
            <td>
                <span class="badge ${thinkingBadge}">
                    ${item?.thinking || '-'}
                </span>
            </td>
            <td>${item?.contentFeedBack || '-'}</td>
            <td>${feedbackManager.formatDate(item?.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary editBtn" data-id="${item._id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger deleteBtn" data-id="${item._id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
    }
}

class APIService {
    constructor() {
        this.cache = new Map();
        this.requests = new Map();
        this.abortControllers = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache lifetime
    }

    // Clear all cache or specific endpoint cache
    clearCache(endpoint = null) {
        if (endpoint) {
            this.cache.delete(endpoint);
            console.log(`Cache cleared for ${endpoint}`);
        } else {
            this.cache.clear();
            console.log("Full cache cleared");
        }
        return this;
    }

    // Abort any ongoing request for the endpoint
    abortRequest(endpoint) {
        if (this.abortControllers.has(endpoint)) {
            this.abortControllers.get(endpoint).abort();
            this.abortControllers.delete(endpoint);
            this.requests.delete(endpoint);
            console.log(`Request aborted for ${endpoint}`);
        }
        return this;
    }

    // Get date-aware cache key to avoid stale data across days
    getCacheKey(endpoint) {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `${date}:${endpoint}`;
    }

    // Check if cached data is still valid
    isCacheValid(cacheKey) {
        if (!this.cache.has(cacheKey)) return false;

        const { timestamp } = this.cache.get(cacheKey);
        const now = Date.now();
        return (now - timestamp) < this.cacheExpiry;
    }

    async fetchData(endpoint, forceRefresh = false) {
        const cacheKey = this.getCacheKey(endpoint);

        // Return cached data if valid and refresh not forced
        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log(`Cache hit for ${endpoint}`);
            return this.cache.get(cacheKey).data;
        }

        // Abort any existing request for this endpoint
        this.abortRequest(endpoint);

        // Create new abort controller for this request
        const controller = new AbortController();
        this.abortControllers.set(endpoint, controller);

        // Create request promise
        const requestPromise = (async () => {
            try {
                const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API error (${response.status}): ${errorText}`);
                }

                const responseData = await response.json();
                const result = responseData.data.data;

                // Store in cache with timestamp
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });

                this.abortControllers.delete(endpoint);
                this.requests.delete(endpoint);

                return result;
            } catch (error) {
                // Don't show aborted request errors
                if (error.name === 'AbortError') {
                    console.log(`Request for ${endpoint} was aborted`);
                    return null;
                }

                this.abortControllers.delete(endpoint);
                this.requests.delete(endpoint);
                console.error('API Error:', error);
                throw error;
            }
        })();

        // Track request
        this.requests.set(endpoint, requestPromise);
        return requestPromise;
    }

    // Improved error handling for all API methods
    async apiRequest(url, method, data = null, options = {}) {
        try {
            const controller = new AbortController();
            const { signal } = controller;

            // Set timeout to abort long requests
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const fetchOptions = {
                method,
                signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                ...options
            };

            if (data) {
                if (data instanceof FormData) {
                    fetchOptions.body = data;
                } else {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                    fetchOptions.body = JSON.stringify(data);
                }
            }

            const response = await fetch(`${API_ENDPOINTS.BASE_URL}${url}`, fetchOptions);
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            // Handle no-content responses
            if (response.status === 204) {
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            // Improve error reporting to user
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async deleteBulkFeedBack(ids) {
        if (!ids.length) return { deleted: 0 };

        const result = await this.apiRequest(
            API_ENDPOINTS.FEEDBACK.DELETE_BULK,
            'DELETE',
            { data: ids }
        );

        // Clear cache after deletion
        this.clearCache();
        return result.data;
    }

    async createFileFeedBack(formData) {
        const result = await this.apiRequest(
            'create-file/feedback',
            'POST',
            formData
        );

        // Clear cache after creation
        this.clearCache();
        return result;
    }

    async updateFeedback(id, data) {
        const result = await this.apiRequest(
            `feedback/${id}`,
            'PATCH',
            data
        );

        // Clear specific cache entries that might be affected
        this.clearCache(API_ENDPOINTS.FEEDBACK.BY_ID(id))
            .clearCache(API_ENDPOINTS.FEEDBACK.ALL);

        // Return updated data
        return result;
    }

    async deleteFeedback(id) {
        await this.apiRequest(
            `feedback/${id}`,
            'DELETE'
        );

        // Clear cache after deletion
        this.clearCache();
        return true;
    }

    async exportExcelFeedback(month) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // Longer timeout for exports

            const response = await fetch(
                `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.FEEDBACK.EXPORT_EXCEL(month)}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const filename = `feedback-${month}-${new Date().toISOString().split('T')[0]}.xlsx`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up object URL after a delay
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Export timed out. The file may be too large or the server is busy.');
            }
            console.error('Export Error:', error);
            throw error;
        }
    }
}

class FeedbackManager {
    constructor(domManager, apiService) {
        this.dom = domManager;
        this.api = apiService;
        this.debounceTimer = null;
        this.abortController = null;

        // Bind methods
        this.formatDate = this.formatDate.bind(this);
        this.handleItemSelection = this.handleItemSelection.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.resetSelection = this.resetSelection.bind(this);

        // Initialize ResizeObserver for responsive adjustments
        this.initResizeObserver();
    }

    initResizeObserver() {
        // Monitor table size changes to optimize rendering for viewport
        if (!window.ResizeObserver) return;

        this.resizeObserver = new ResizeObserver(this.debounce(() => {
            // Only re-render if we already have data to avoid unnecessary API calls
            if (this.currentFeedbackData && this.currentFeedbackData.length > 0) {
                this.dom.renderTable(this.currentFeedbackData);
            }
        }, 200));

        const table = document.querySelector('.table-container');
        if (table) {
            this.resizeObserver.observe(table);
        }
    }

    resetEditingState() {
        state.editing.id = null;
        state.editing.data = null;
    }

    getBadgeClass(value) {
        return BADGE_CLASSES[value] || '';
    }

    formatDate(dateString) {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';

            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            console.warn('Date format error:', e);
            return '-';
        }
    }

    debounce(func, wait) {
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

    async handleSubmit() {
        if (state.isLoading) return;
        if (!state.editing.id) {
            showNotification(eToast.warning, "No feedback selected for editing!");
            return;
        }

        state.isLoading = true;
        const submitBtn = this.dom.elements.btnSubmitFeedback;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Updating...";
        submitBtn.disabled = true;
        this.dom.showLoading();

        try {
            const formData = this.collectFormData();
            await this.api.updateFeedback(state.editing.id, formData);
            showNotification(eToast.success, "Feedback updated successfully");
            this.dom.closeDialog();
            await this.refreshData();
        } catch (error) {
            showNotification(eToast.error, `Failed to update feedback: ${error.message || 'Unknown error'}`);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            state.isLoading = false;
            this.dom.hideLoading();
        }
    }

    collectFormData() {
        // Get content from TinyMCE with safety check
        let content = '';
        const tinyEditor = tinymce.get('EvaluateContent');
        if (tinyEditor) {
            content = tinyEditor.getContent();
        }

        // Get skill radio value
        const skill = Array.from(this.dom.elements.radioProgramming)
            .find(radio => radio.checked)?.value || '';

        // Get thinking radio value
        const thinking = Array.from(this.dom.elements.radioThinking)
            .find(radio => radio.checked)?.value || '';

        // Get subject scores
        const subjectScores = Array.from(
            this.dom.elements.tableLanguages.querySelectorAll("tr.language")
        ).map(tr => ({
            languageIt: tr.dataset.id,
            level: tr.querySelector("select").value,
            score: tr.querySelector("input[type='number']").value
        }));

        return {
            contentFeedBack: content,
            skill,
            thinking,
            subjectScores
        };
    }

    async createFileFeedBack() {
        if (state.isLoading) return;

        const file = this.dom.elements.selectFile.files[0];
        if (!file) {
            showNotification(eToast.warning, "Please select a file first");
            return;
        }

        // Validate file type
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type)) {
            showNotification(eToast.error, "Please select a valid Excel file (.xlsx or .xls)");
            return;
        }

        state.isLoading = true;
        const importBtn = this.dom.elements.importFile;
        const originalText = importBtn.textContent;
        importBtn.textContent = "Importing...";
        importBtn.disabled = true;
        this.dom.showLoading();

        try {
            const formData = new FormData();
            formData.append("excel", file);
            const result = await this.api.createFileFeedBack(formData);

            // Check for partial success with warnings
            if (result.warnings && result.warnings.length > 0) {
                showNotification(eToast.warning,
                    `Import completed with ${result.warnings.length} warnings. Some records may not be imported correctly.`);
            } else {
                showNotification(eToast.success, "Feedback created successfully");
            }

            // Force refresh after create
            await this.refreshData();
            // Clear file input after successful import
            this.dom.elements.selectFile.value = "";
        } catch (error) {
            showNotification(eToast.error, `Failed to create feedback from file: ${error.message || 'Unknown error'}`);
        } finally {
            importBtn.textContent = originalText;
            importBtn.disabled = false;
            state.isLoading = false;
            this.dom.hideLoading();
        }
    }

    async renderFeedback(forceRefresh = false) {
        if (state.isLoading && !forceRefresh) return;

        // Cancel any in-flight requests to avoid race conditions
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        state.isLoading = true;
        this.dom.renderTableLoading();

        try {
            // Use progressive loading approach
            this.loadFeedbackData(forceRefresh);
        } catch (error) {
            console.error("Render feedback error:", error);
            showNotification(eToast.error, `Failed to load feedback: ${error.message || 'Unknown error'}`);
            this.dom.renderTable([]);
            state.isLoading = false;
        }
    }

    async loadFeedbackData(forceRefresh) {
        try {
            const data = await this.fetchFilteredData(forceRefresh);

            // Store fetched data for virtual scrolling/rerendering
            this.currentFeedbackData = data;

            // Check if this request was canceled before rendering
            if (this.abortController.signal.aborted) {
                console.log('Rendering aborted - newer request in progress');
                return;
            }

            this.dom.renderTable(data);

            // Update UI state after successful render
            state.isLoading = false;

            // Apply current search filter if any
            const searchTerm = this.dom.elements.searchStudent.value;
            if (searchTerm) {
                const event = new Event('input', { bubbles: true });
                this.dom.elements.searchStudent.dispatchEvent(event);
            }
        } catch (error) {
            console.error("Load feedback error:", error);
            this.dom.renderTable([]);
            state.isLoading = false;
            throw error;
        }
    }

    async fetchFilteredData(forceRefresh = false) {
        const teacherId = state.currentView.teacherId;
        const month = state.currentView.month;
        let endpoint;

        if (teacherId === 'all' && month === 'all') {
            endpoint = API_ENDPOINTS.FEEDBACK.ALL;
        } else if (teacherId === 'all') {
            endpoint = API_ENDPOINTS.FEEDBACK.BY_MONTH(month);
        } else if (month === 'all') {
            endpoint = API_ENDPOINTS.FEEDBACK.BY_TEACHER(teacherId);
        } else {
            endpoint = API_ENDPOINTS.FEEDBACK.BY_TEACHER_AND_MONTH(teacherId, month);
        }

        return await this.api.fetchData(endpoint, forceRefresh);
    }

    handleSelectAll(e) {
        const isChecked = e.target.checked;
        state.selection.all = isChecked;

        if (!this.currentFeedbackData) return;

        if (isChecked) {
            // Select all visible items
            state.selection.items = this.currentFeedbackData.map(item => item._id);
        } else {
            // Deselect all
            state.selection.items = [];
        }

        // Update checkboxes in DOM to match state
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });

        this.dom.updateBulkActionsVisibility(state.selection.items.length);
    }

    handleItemSelection(e) {
        const checkbox = e.target;
        const feedbackId = checkbox.value;

        if (checkbox.checked) {
            if (!state.selection.items.includes(feedbackId)) {
                state.selection.items.push(feedbackId);
            }
        } else {
            state.selection.items = state.selection.items.filter(id => id !== feedbackId);
            this.dom.elements.selectAll.checked = false;
            state.selection.all = false;
        }

        this.dom.updateBulkActionsVisibility(state.selection.items.length);
    }

    resetSelection() {
        state.selection.items = [];
        state.selection.all = false;
        this.dom.elements.selectAll.checked = false;
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.dom.updateBulkActionsVisibility(0);
    }

    async handleBulkDelete() {
        if (state.isLoading || state.selection.items.length === 0) {
            if (state.selection.items.length === 0) {
                showNotification(eToast.warning, "No items selected");
            }
            return;
        }

        if (!confirm(`Are you sure you want to delete ${state.selection.items.length} selected items?`)) {
            return;
        }

        const bulkDeleteBtn = document.getElementById('bulkDelete');
        if (!bulkDeleteBtn) return;

        state.isLoading = true;
        bulkDeleteBtn.disabled = true;
        bulkDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        this.dom.showLoading();

        try {
            await this.api.deleteBulkFeedBack(state.selection.items);
            showNotification(eToast.success, `Deleted ${state.selection.items.length} items`);
            this.resetSelection();
            // Force refresh after delete
            await this.refreshData();
        } catch (error) {
            showNotification(eToast.error, `Failed to delete selected items: ${error.message || 'Unknown error'}`);
        } finally {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Selected';
            state.isLoading = false;
            this.dom.hideLoading();
        }
    }

    async handleBulkExport() {
        // Implementation for exporting selected items only
        if (state.selection.items.length === 0) {
            showNotification(eToast.warning, "No items selected for export");
            return;
        }

        // This would require backend support for selective export
        showNotification(eToast.info, "Bulk export feature coming soon");
    }

    async handleEdit(id) {
        if (state.isLoading) return;

        state.isLoading = true;
        this.dom.showLoading();

        try {
            const data = await this.api.fetchData(API_ENDPOINTS.FEEDBACK.BY_ID(id));
            if (!data) throw new Error("No feedback data found");

            state.editing.id = id;
            state.editing.data = data;
            this.populateEditForm(data);

            // Show dialog with animation
            const dialog = this.dom.elements.dialogReview;
            dialog.style.display = "block";
            dialog.classList.add('dialog-opening');
            setTimeout(() => dialog.classList.remove('dialog-opening'), 300);
        } catch (error) {
            showNotification(eToast.error, `Failed to load feedback data: ${error.message || 'Unknown error'}`);
        } finally {
            state.isLoading = false;
            this.dom.hideLoading();
        }
    }

    async handleExport() {
        if (state.isLoading) return;

        const month = this.dom.elements.selectTime.value;
        if (month === 'all') {
            if (!confirm("Exporting all months may generate a large file. Continue?")) {
                return;
            }
        }

        state.isLoading = true;
        const exportBtn = this.dom.elements.exportFile;
        const originalText = exportBtn.textContent;
        exportBtn.textContent = "Exporting...";
        exportBtn.disabled = true;
        this.dom.showLoading();

        try {
            await this.api.exportExcelFeedback(month);
            showNotification(eToast.success, "Feedback exported successfully");
        } catch (error) {
            showNotification(eToast.error, `Failed to export feedback data: ${error.message || 'Unknown error'}`);
        } finally {
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
            state.isLoading = false;
            this.dom.hideLoading();
        }
    }

    async handleDelete(id) {
        if (state.isLoading) return;

        if (!confirm("Are you sure you want to delete this feedback?")) return;

        state.isLoading = true;
        this.dom.showLoading();

        try {
            await this.api.deleteFeedback(id);
            showNotification(eToast.success, "Feedback deleted successfully");
            // Force refresh after delete
            await this.refreshData();
        } catch (error) {
            showNotification(eToast.error, `Failed to delete feedback: ${error.message || 'Unknown error'}`);
        } finally {
            state.isLoading = false;
            this.dom.hideLoading();
        }
    }

    populateEditForm(data) {
        // Basic info
        this.dom.elements.nameStudents.textContent = data.studentsAccount?.fullname || 'N/A';
        this.dom.elements.phoneStudents.textContent = data.studentsAccount?.phone || 'No phone number';

        // Set radio buttons for programming skill
        this.dom.elements.radioProgramming.forEach(radio => {
            radio.checked = (radio.value === data.skill);
        });

        // Set radio buttons for thinking skill
        this.dom.elements.radioThinking.forEach(radio => {
            radio.checked = (radio.value === data.thinking);
        });

        // Set TinyMCE content with safety check
        const editor = tinymce.get('EvaluateContent');
        if (editor) {
            editor.setContent(data.contentFeedBack || '');
        } else {
            console.warn('TinyMCE editor not found');
            // Fallback for when TinyMCE is not yet initialized
            setTimeout(() => {
                const retryEditor = tinymce.get('EvaluateContent');
                if (retryEditor) {
                    retryEditor.setContent(data.contentFeedBack || '');
                }
            }, 500);
        }

        // Render subject scores
        this.renderSubjectScores(data.subjectScores);
    }

    renderSubjectScores(scores = []) {
        if (!scores || !scores.length) {
            this.dom.elements.tableLanguages.innerHTML = `
                <tr><td colspan="3">No subject scores available</td></tr>
            `;
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const tempContainer = document.createElement('tbody');

        // Create HTML for all scores
        const scoresHtml = scores.map(score => {
            if (!score.languageIt) return '';

            return `
                <tr class="language" data-id="${score.languageIt._id}">
                    <td>${score.languageIt.nameCode || 'Unknown'}</td>
                    <td>
                        <select class="form-select">
                            <option value="">Select</option>
                            ${[1, 2, 3].map(level => `
                                <option value="${level}" ${score.level === level.toString() ? "selected" : ""}>
                                    Level ${level}
                                </option>
                            `).join('')}
                        </select>
                    </td>
                    <td>
                        <input type="number" class="form-control" min="0" value="${score.score || 0}"/>
                    </td>
                </tr>
            `;
        }).join("");

        tempContainer.innerHTML = scoresHtml;

        // Move nodes to fragment
        while (tempContainer.firstChild) {
            fragment.appendChild(tempContainer.firstChild);
        }

        // Clear and update the table
        this.dom.elements.tableLanguages.innerHTML = '';
        this.dom.elements.tableLanguages.appendChild(fragment);
    }

    async refreshData() {
        this.api.clearCache();
        await this.renderFeedback(true);
        showNotification(eToast.success, "Data has been refreshed");
        return true;
    }
}

// Initialize on DOMContentLoaded with performance optimizations
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Add page styles for better UX
        addPageStyles();

        // Initialize with progressive loading
        await initializeApp();
    } catch (error) {
        console.error("Initialization error:", error);
        showNotification(eToast.error, "Failed to initialize feedback page");
    }
});

// Add dynamic styles for better UX
function addPageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Loading overlay */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .loading-overlay.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .loading-spinner {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Table skeleton loader */
        .skeleton-loader {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
            width: 100%;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Dialog transitions */
        #dialogReview {
            transition: opacity 0.3s;
        }
        
        .dialog-opening {
            animation: fadeIn 0.3s forwards;
        }
        
        .dialog-closing {
            animation: fadeOut 0.3s forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        /* Refresh button animation */
        .refresh-btn .fa-sync-alt {
            transition: transform 0.5s;
        }
        
        .refresh-btn:hover .fa-sync-alt {
            transform: rotate(180deg);
        }
        
        .refresh-btn.refreshing .fa-sync-alt {
            animation: rotating 1s linear infinite;
        }
        
        @keyframes rotating {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Copy icon feedback */
        .copy-icon {
            cursor: pointer;
            margin-left: 5px;
            transition: color 0.3s;
        }
        
        .copy-icon:hover {
            color: #007bff;
        }
        
        .copy-icon.copied {
            color: #28a745;
            animation: pulse 1s;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        /* Better bulk actions visibility */
        .bulk-actions {
            position: fixed;
            bottom: -60px;
            left: 0;
            right: 0;
            background: #343a40;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
            transition: bottom 0.3s;
        }
        
        .bulk-actions.visible {
            bottom: 0;
        }
        
        .selected-count {
            font-weight: bold;
            margin-right: 20px;
        }
        
        /* Virtual scrolling optimizations */
        .virtual-scroll-container {
            overflow: auto;
            position: relative;
            height: 500px;
        }
        
        .virtual-scroll-content {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        }
        
        /* Responsive improvements */
        @media (max-width: 768px) {
            .action-buttons {
                display: flex;
                flex-direction: column;
            }
            
            .action-buttons button {
                margin-bottom: 5px;
            }
            
            .bulk-actions {
                flex-direction: column;
                padding: 15px;
            }
            
            .bulk-actions button {
                margin-top: 10px;
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);
}

// Progressive app initialization
async function initializeApp() {
    // Step 1: Show loading indicator and initialize essential UI
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'initial-loading';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading application...</p>';
    loadingIndicator.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.9);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;';
    document.body.appendChild(loadingIndicator);

    // Step 2: Initialize managers (non-blocking)
    domManager = new DOMManager();
    apiService = new APIService();

    // Step 3: Initialize TinyMCE (critical for edit dialogs)
    try {
        await initializeTinyMCE();
        console.log('TinyMCE initialized successfully');
    } catch (error) {
        console.error('TinyMCE initialization failed:', error);
        // Continue anyway - we might not need the editor right away
    }

    // Step 4: Initialize feedback manager and set default month
    feedbackManager = new FeedbackManager(domManager, apiService);

    // Set default month to current month
    domManager.elements.selectTime.value = state.currentView.month;

    // Step 5: Remove loading indicator
    document.body.removeChild(loadingIndicator);

    // Step 6: Fetch initial data
    await feedbackManager.renderFeedback();

    // Step 7: Initialize lazy-loaded components
    initializeLazyFeatures();

    // Step 8: Enable periodic refresh for real-time data
    initializePeriodicRefresh();
}

// Initialize TinyMCE with optimized settings
async function initializeTinyMCE() {
    return new Promise((resolve, reject) => {
        try {
            // Check if TinyMCE is already loaded
            if (typeof tinymce === 'undefined') {
                console.warn('TinyMCE not found, will try again later');
                // Set timeout to retry
                setTimeout(() => {
                    initializeTinyMCE().then(resolve).catch(reject);
                }, 1000);
                return;
            }

            tinymce.init({
                selector: '#EvaluateContent',
                menubar: false,
                plugins: 'link lists',
                toolbar: 'bold italic | bullist numlist | link',
                branding: false,
                statusbar: false,
                resize: false,
                min_height: 200,
                setup: function (editor) {
                    editor.on('init', function () {
                        resolve();
                    });
                },
                init_instance_callback: function () {
                    // Hide loading indicators once TinyMCE is ready
                    document.querySelector('.tox-tinymce-inline__spinner')?.remove();
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Initialize features that can be loaded after main content
function initializeLazyFeatures() {
    // Add keyboard shortcuts for power users
    document.addEventListener('keydown', (e) => {
        // Ctrl+R or Cmd+R for refresh (when not in form inputs)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            feedbackManager.refreshData();
        }

        // Escape to close dialog
        if (e.key === 'Escape' && domManager.elements.dialogReview.style.display === 'block') {
            domManager.closeDialog();
            feedbackManager.resetEditingState();
        }
    });

    // Enable tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
    }
}

// Setup periodic refresh to keep data fresh
function initializePeriodicRefresh() {
    // Check for updates every 5 minutes if user is active
    let userActive = true;
    let refreshInterval;

    // Set up refresh interval only when user is active
    function setupRefreshInterval() {
        if (refreshInterval) clearInterval(refreshInterval);

        if (userActive) {
            refreshInterval = setInterval(() => {
                // Only refresh if user hasn't interacted with data recently
                const lastActionTime = localStorage.getItem('lastUserAction');
                const now = Date.now();

                // If no action in the last 2 minutes, do background refresh
                if (!lastActionTime || (now - parseInt(lastActionTime)) > 2 * 60 * 1000) {
                    // Silent refresh without notifications
                    apiService.clearCache();
                    feedbackManager.renderFeedback(true);
                }
            }, 5 * 60 * 1000); // 5 minutes
        }
    }

    // Track user activity
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, () => {
            userActive = true;
            localStorage.setItem('lastUserAction', Date.now().toString());
            setupRefreshInterval();
        }, { passive: true });
    });

    // Track user inactivity
    document.addEventListener('visibilitychange', () => {
        userActive = !document.hidden;
        setupRefreshInterval();
    });

    // Initial setup
    setupRefreshInterval();
}