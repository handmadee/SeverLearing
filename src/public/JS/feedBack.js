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

let domManager;
let apiService;
let feedbackManager;
let cachedFeedbackData = null;

class DOMManager {
    constructor() {
        this.elements = {
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
            bulkActions: document.querySelector('.bulk-actions') || this.createBulkActionsContainer()
        };

        this.initializeEventListeners();
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

    initializeEventListeners() {
        const {
            btnCloseDialog, btnSubmitFeedback, searchStudent,
            selectTeacher, selectTime, importFile, exportFile, selectAll
        } = this.elements;

        btnCloseDialog.addEventListener('click', () => this.closeDialog());
        btnSubmitFeedback.addEventListener('click', () => feedbackManager.handleSubmit());
        searchStudent.addEventListener('input', this.handleSearch.bind(this));
        selectTeacher.addEventListener("change", () => feedbackManager.renderFeedback());
        selectTime.addEventListener("change", () => feedbackManager.renderFeedback());
        importFile.addEventListener("click", () => feedbackManager.createFileFeedBack());
        exportFile.addEventListener("click", () => feedbackManager.handleExport());
        selectAll.addEventListener('change', (e) => feedbackManager.handleSelectAll(e));

        document.getElementById('bulkDelete')?.addEventListener('click',
            () => feedbackManager.handleBulkDelete());
    }

    closeDialog() {
        this.elements.dialogReview.style.display = "none";
        feedbackManager.resetEditingState();
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#contentTable tr');

        // Using requestAnimationFrame for smoother UI during search
        requestAnimationFrame(() => {
            rows.forEach(row => {
                const studentNameCell = row.querySelector('td:nth-child(2)');
                if (studentNameCell) {
                    const studentName = studentNameCell.textContent.toLowerCase();
                    row.style.display = studentName.includes(searchTerm) ? '' : 'none';
                }
            });
        });
    }
}

class APIService {
    #cache = new Map();

    async fetchData(endpoint, forceRefresh = false) {
        const cacheKey = endpoint;
        if (!forceRefresh && this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const result = data.data.data;

            // Cache the result
            this.#cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error("Failed to fetch data");
        }
    }

    async deleteBulkFeedBack(ids) {
        if (!ids.length) return;

        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.FEEDBACK.DELETE_BULK}`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: ids })
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            // Clear cache after successful deletion
            this.#cache.clear();
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error("Failed to delete feedback items");
        }
    }

    async createFileFeedBack(formData) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}create-file/feedback`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Create failed: ${response.status}`);
            }

            // Clear cache after adding new data
            this.#cache.clear();
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create File Error:', error);
            throw new Error("Failed to create feedback from file");
        }
    }

    async updateFeedback(id, data) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}feedback/${id}`, {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Update failed: ${response.status}`);
            }

            // Clear cache after update
            this.#cache.clear();
            return await response.json();
        } catch (error) {
            console.error('Update Error:', error);
            throw new Error("Failed to update feedback");
        }
    }

    async deleteFeedback(id) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}feedback/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            // Clear cache after deletion
            this.#cache.clear();
            return true;
        } catch (error) {
            console.error('Delete Error:', error);
            throw new Error("Failed to delete feedback");
        }
    }

    async exportExcelFeedback(month) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.FEEDBACK.EXPORT_EXCEL(month)}`);

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status}`);
            }

            const data = await response.blob();
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-${month}.xlsx`;
            a.click();

            // Clean up
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            return true;
        } catch (error) {
            console.error('Export Error:', error);
            throw new Error("Failed to export feedback data");
        }
    }
}

class FeedbackManager {
    constructor(domManager, apiService) {
        this.dom = domManager;
        this.api = apiService;
        this.feedbackIdEditing = null;
        this.currentFeedbackData = null;
        this.selectedItems = [];

        this.formatDate = this.formatDate.bind(this);
        this.handleItemSelection = this.handleItemSelection.bind(this);
    }

    resetEditingState() {
        this.feedbackIdEditing = null;
        this.currentFeedbackData = null;
    }

    getBadgeClass(value) {
        return BADGE_CLASSES[value] || '';
    }

    formatDate(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    async handleSubmit() {
        if (!this.feedbackIdEditing) {
            createToastV(eToast.warning, "No feedback selected for editing!");
            return;
        }

        try {
            const formData = this.collectFormData();
            await this.api.updateFeedback(this.feedbackIdEditing, formData);
            createToastV(eToast.success, "Feedback updated successfully");
            this.dom.closeDialog();
            await this.renderFeedback();
        } catch (error) {
            createToastV(eToast.error, "Failed to update feedback");
        }
    }

    collectFormData() {
        const content = tinymce.get('EvaluateContent').getContent();

        const skill = Array.from(this.dom.elements.radioProgramming)
            .find(radio => radio.checked)?.value || '';

        const thinking = Array.from(this.dom.elements.radioThinking)
            .find(radio => radio.checked)?.value || '';

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
        const file = this.dom.elements.selectFile.files[0];

        if (!file) {
            createToastV(eToast.warning, "Please select a file first");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("excel", file);
            await this.api.createFileFeedBack(formData);
            createToastV(eToast.success, "Feedback created successfully");
            await this.renderFeedback();
        } catch (error) {
            createToastV(eToast.error, "Failed to create feedback from file");
        }
    }

    async renderFeedback() {
        this.renderLoading();

        try {
            const data = await this.fetchFilteredData();
            this.renderItems(data);
        } catch (error) {
            console.error("Render feedback error:", error);
            createToastV(eToast.error, "Failed to load feedback");
            this.renderItems([]);
        }
    }

    async fetchFilteredData() {
        const teacherId = this.dom.elements.selectTeacher.value;
        const month = this.dom.elements.selectTime.value;
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

        return await this.api.fetchData(endpoint, true); // Force refresh
    }

    renderLoading() {
        this.dom.elements.contentTable.innerHTML = `
            <tr>
                <td colspan="7" class="py-5 text-center">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    renderItems(feedbackList = []) {
        if (!feedbackList.length) {
            this.dom.elements.contentTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3">No feedback available at this time</td>
                </tr>
            `;
            return;
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        const tempContainer = document.createElement('tbody');
        tempContainer.innerHTML = feedbackList.map(this.createFeedbackRow.bind(this)).join("");

        // Append all nodes from the temporary container to the fragment
        while (tempContainer.firstChild) {
            fragment.appendChild(tempContainer.firstChild);
        }

        // Clear and update the table
        this.dom.elements.contentTable.innerHTML = '';
        this.dom.elements.contentTable.appendChild(fragment);

        this.attachRowEventListeners();
        this.restoreSelectionState(feedbackList);
    }

    restoreSelectionState(feedbackList) {
        if (this.selectedItems.length === 0) return;

        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            if (this.selectedItems.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });

        const allChecked = this.selectedItems.length === feedbackList.length;
        this.dom.elements.selectAll.checked = allChecked;
        this.updateBulkActionsVisibility();
    }

    resetSelection() {
        this.selectedItems = [];
        this.updateBulkActionsVisibility();
    }

    createFeedbackRow(item) {
        const studentName = item?.studentsAccount?.fullname || '-';
        const teacherName = item?.teacherAccount?.username || '-';
        const studentId = item?.studentsAccount?._id || '';
        const skillBadge = this.getBadgeClass(item?.skill);
        const thinkingBadge = this.getBadgeClass(item?.thinking);

        return `
            <tr>
                <td class="checkbox-container">
                    <input type="checkbox" class="item-checkbox" value="${item._id}">
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
                <td>${this.formatDate(item?.createdAt)}</td>
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
            </tr>
        `;
    }

    attachRowEventListeners() {
        // Use event delegation for better performance
        const table = this.dom.elements.contentTable;

        table.addEventListener('click', (e) => {
            const target = e.target;

            // Edit button
            if (target.classList.contains('editBtn') || target.closest('.editBtn')) {
                const button = target.classList.contains('editBtn') ? target : target.closest('.editBtn');
                this.handleEdit(button.dataset.id);
            }

            // Delete button
            if (target.classList.contains('deleteBtn') || target.closest('.deleteBtn')) {
                const button = target.classList.contains('deleteBtn') ? target : target.closest('.deleteBtn');
                this.handleDelete(button.dataset.id);
            }

            // Copy icon
            if (target.classList.contains('copy-icon')) {
                const studentId = target.dataset.studentId;
                if (studentId) {
                    const link = `${window.location.origin}/admin/parents/students/${studentId}`;
                    navigator.clipboard.writeText(link)
                        .then(() => createToastV(eToast.success, "Copied link to clipboard"))
                        .catch(() => createToastV(eToast.error, "Failed to copy link"));
                }
            }
        });

        // Attach checkbox event listeners
        document.querySelectorAll(".item-checkbox").forEach(checkbox => {
            checkbox.addEventListener("change", (e) => this.handleItemSelection(e));
        });
    }

    handleSelectAll(e) {
        const isChecked = e.target.checked;
        const checkboxes = document.querySelectorAll('.item-checkbox');

        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;

            // Update selection state without triggering events
            const feedbackId = checkbox.value;
            const isSelected = this.selectedItems.includes(feedbackId);

            if (isChecked && !isSelected) {
                this.selectedItems.push(feedbackId);
            } else if (!isChecked && isSelected) {
                this.selectedItems = this.selectedItems.filter(id => id !== feedbackId);
            }
        });

        this.updateBulkActionsVisibility();
    }

    handleItemSelection(e) {
        const checkbox = e.target;
        const feedbackId = checkbox.value;

        if (checkbox.checked) {
            if (!this.selectedItems.includes(feedbackId)) {
                this.selectedItems.push(feedbackId);
            }
        } else {
            this.selectedItems = this.selectedItems.filter(id => id !== feedbackId);
            this.dom.elements.selectAll.checked = false;
        }

        this.updateBulkActionsVisibility();
    }

    updateBulkActionsVisibility() {
        const bulkActions = document.querySelector('.bulk-actions');
        const countElem = document.querySelector('.selected-count');
        const bulkDeleteBtn = document.getElementById('bulkDelete');

        if (!bulkActions || !countElem || !bulkDeleteBtn) return;

        if (this.selectedItems.length > 0) {
            bulkActions.classList.add('visible');
            countElem.textContent = `${this.selectedItems.length} selected`;
            bulkDeleteBtn.disabled = false;
        } else {
            bulkActions.classList.remove('visible');
            bulkDeleteBtn.disabled = true;
        }
    }

    async handleBulkDelete() {
        if (this.selectedItems.length === 0) {
            createToastV(eToast.warning, "No items selected");
            return;
        }

        if (!confirm(`Are you sure you want to delete ${this.selectedItems.length} selected items?`)) {
            return;
        }

        const bulkDeleteBtn = document.getElementById('bulkDelete');
        if (!bulkDeleteBtn) return;

        try {
            bulkDeleteBtn.disabled = true;
            bulkDeleteBtn.innerHTML = 'Deleting...';

            await this.api.deleteBulkFeedBack(this.selectedItems);
            createToastV(eToast.success, `Deleted ${this.selectedItems.length} items`);
            this.resetSelection();
            await this.renderFeedback();
        } catch (error) {
            createToastV(eToast.error, "Failed to delete selected items");
        } finally {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.innerHTML = 'Delete Selected';
        }
    }

    async handleEdit(id) {
        try {
            const data = await this.api.fetchData(API_ENDPOINTS.FEEDBACK.BY_ID(id));
            if (!data) throw new Error("No feedback data found");

            this.feedbackIdEditing = id;
            this.currentFeedbackData = data;
            this.populateEditForm(data);
            this.dom.elements.dialogReview.style.display = "block";
        } catch (error) {
            createToastV(eToast.error, "Failed to load feedback data");
        }
    }

    async handleExport() {
        const month = this.dom.elements.selectTime.value;
        try {
            await this.api.exportExcelFeedback(month);
            createToastV(eToast.success, "Feedback exported successfully");
        } catch (error) {
            createToastV(eToast.error, "Failed to export feedback data");
        }
    }

    async handleDelete(id) {
        if (!confirm("Are you sure you want to delete this feedback?")) return;

        try {
            await this.api.deleteFeedback(id);
            createToastV(eToast.success, "Feedback deleted successfully");
            await this.renderFeedback();
        } catch (error) {
            createToastV(eToast.error, "Failed to delete feedback");
        }
    }

    populateEditForm(data) {
        this.dom.elements.nameStudents.textContent = data.studentsAccount?.fullname || 'N/A';
        this.dom.elements.phoneStudents.textContent = data.studentsAccount?.phone || 'No phone number';

        // Set radio buttons
        this.dom.elements.radioProgramming.forEach(radio => {
            radio.checked = (radio.value === data.skill);
        });

        this.dom.elements.radioThinking.forEach(radio => {
            radio.checked = (radio.value === data.thinking);
        });

        // Set TinyMCE content
        tinymce.get('EvaluateContent').setContent(data.contentFeedBack || '');

        // Render subject scores
        this.renderSubjectScores(data.subjectScores);
    }

    renderSubjectScores(scores = []) {
        if (!scores.length) {
            this.dom.elements.tableLanguages.innerHTML = `
                <tr><td colspan="3">No subject scores available</td></tr>
            `;
            return;
        }

        const scoresHtml = scores.map(score => `
            <tr class="language" data-id="${score.languageIt._id}">
                <td>${score.languageIt.nameCode}</td>
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
        `).join("");

        this.dom.elements.tableLanguages.innerHTML = scoresHtml;
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize TinyMCE
        await tinymce.init({
            selector: '#EvaluateContent',
            menubar: false,
            plugins: 'link lists',
            toolbar: 'bold italic | bullist numlist | link'
        });

        // Initialize managers
        domManager = new DOMManager();
        apiService = new APIService();
        feedbackManager = new FeedbackManager(domManager, apiService);

        // Set default month to current month
        domManager.elements.selectTime.value = new Date().getMonth() + 1;

        // Initial render
        await feedbackManager.renderFeedback();
    } catch (error) {
        console.error("Initialization error:", error);
        createToastV(eToast.error, "Failed to initialize feedback page");
    }
});