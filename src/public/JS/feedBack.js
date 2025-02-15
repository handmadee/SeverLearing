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
        EXPORT_EXCEL: (month) => `feedback/export-feedback/?month=${month}`
    }
};

let domManager;
let apiService;
let feedbackManager;

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
            exportFile: document.getElementById("exportButton")
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.elements.btnCloseDialog.addEventListener('click', this.closeDialog.bind(this));
        this.elements.btnSubmitFeedback.addEventListener('click', () => feedbackManager.handleSubmit());
        this.elements.searchStudent.addEventListener('input', (e) => this.handleSearch(e));
        this.elements.selectTeacher.addEventListener("change", () => feedbackManager.renderFeedback());
        this.elements.selectTime.addEventListener("change", () => feedbackManager.renderFeedback());
        this.elements.importFile.addEventListener("click", () => feedbackManager.createFileFeedBack());
        this.elements.exportFile.addEventListener("click", () => feedbackManager.handleExport());
    }

    closeDialog() {
        this.elements.dialogReview.style.display = "none";
        feedbackManager.resetEditingState();
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#contentTable tr');
        rows.forEach(row => {
            const studentName = row.querySelector('td:first-child')?.textContent.toLowerCase();
            row.style.display = studentName?.includes(searchTerm) ? '' : 'none';
        });
    }
}

class APIService {
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`);
            const data = await response.json();
            return data.data.data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error("Failed to fetch data");
        }
    }

    async createFileFeedBack(body) {
        try {
            const response = await fetch(`${LOCALHOST_API_URL}create-file/feedback`, {
                method: "POST",
                body: body,
            });
            const data = await response.json();
            if (data) {
                createToastV('success', "Tạo  đánh giá thành công");
                location.reload();
            }
        } catch (error) {
            console.log(error);
            createToastV(eToast.error, "Tạo  đánh giá thất bại");
        }
    };

    async updateFeedback(id, data) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}feedback/${id}`, {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Update failed");
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
            if (!response.ok) throw new Error("Delete failed");
            return true;
        } catch (error) {
            console.error('Delete Error:', error);
            throw new Error("Failed to delete feedback");
        }
    }

    async exportExcelFeedback(month) {
        try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.FEEDBACK.EXPORT_EXCEL(month)}`);
            const data = await response.blob();
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-${month}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            return response;
        } catch (error) {
            console.error('Export Error:', error);
            createToastV(eToast.error, "Failed to export feedback data");
        }
    }
}

class FeedbackManager {
    constructor(domManager, apiService) {
        this.dom = domManager;
        this.api = apiService;
        this.feedbackIdEditing = null;
        this.currentFeedbackData = null;
    }

    resetEditingState() {
        this.feedbackIdEditing = null;
        this.currentFeedbackData = null;
    }

    getBadgeClass(value) {
        const badges = {
            good: 'badge-good',
            rather: 'badge-rather',
            medium: 'badge-medium'
        };
        return badges[value] || '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    async handleSubmit() {
        if (!this.feedbackIdEditing) {
            alert("No feedback selected for editing!");
            return;
        }

        const formData = this.collectFormData();
        try {
            await this.api.updateFeedback(this.feedbackIdEditing, formData);
            createToastV('success', "Feedback updated successfully");
            this.dom.closeDialog();
            await this.renderFeedback();
        } catch (error) {
            createToastV("Failed to update feedback");
        }
    }

    collectFormData() {
        const content = tinymce.get('EvaluateContent').getContent();
        const skill = Array.from(this.dom.elements.radioProgramming)
            .find(radio => radio.checked)?.value || '';
        const thinking = Array.from(this.dom.elements.radioThinking)
            .find(radio => radio.checked)?.value || '';

        const subjectScores = Array.from(this.dom.elements.tableLanguages.querySelectorAll("tr.language"))
            .map(tr => ({
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
        const formData = new FormData();
        if (!this.dom.elements.selectFile.files[0]) {
            return createToastV(eToast.warning, "Vui lòng chọn file 1");
        }
        formData.append("excel", this.dom.elements.selectFile.files[0]);
        await this.api.createFileFeedBack(formData);
    }




    async renderFeedback() {
        this.renderLoading();
        try {
            const data = await this.fetchFilteredData();
            console.log(data.slice(0, 10));
            this.renderItems(data);
        } catch (error) {
            createToastV(eToast.error, "Failed to load feedback");
            this.renderItems([]);
        }
    }

    async fetchFilteredData() {
        const teacherId = this.dom.elements.selectTeacher.value;
        const month = this.dom.elements.selectTime.value;

        if (teacherId === 'all' && month === 'all') {
            return await this.api.fetchData(API_ENDPOINTS.FEEDBACK.ALL);
        } else if (teacherId === 'all') {
            return await this.api.fetchData(API_ENDPOINTS.FEEDBACK.BY_MONTH(month));
        } else if (month === 'all') {
            return await this.api.fetchData(API_ENDPOINTS.FEEDBACK.BY_TEACHER(teacherId));
        }
        return await this.api.fetchData(API_ENDPOINTS.FEEDBACK.BY_TEACHER_AND_MONTH(teacherId, month));
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

        this.dom.elements.contentTable.innerHTML = feedbackList.map(this.createFeedbackRow.bind(this)).join("");
        this.attachRowEventListeners();
    }

    createFeedbackRow(item) {
        return `
            <tr>
                <td>
                    <div class="student-cell">
                        ${item?.studentsAccount?.fullname || '-'}
                        <i class="fas fa-copy copy-icon" 
                           data-student-id="${item?.studentsAccount?._id}"
                           title="Copy link"></i>
                    </div>
                </td>
                <td>${item?.teacherAccount?.username || '-'}</td>
                <td>
                    <span class="badge ${this.getBadgeClass(item?.skill)}">
                        ${item?.skill || '-'}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getBadgeClass(item?.thinking)}">
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
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", () => this.handleEdit(btn.dataset.id));
        });

        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", () => this.handleDelete(btn.dataset.id));
        });

        document.querySelectorAll(".copy-icon").forEach(icon => {
            icon.addEventListener("click", (e) => {
                const studentId = e.target.dataset.studentId;
                if (studentId) {
                    const link = `${window.location.origin}/admin/parents/students/${studentId}`;
                    navigator.clipboard.writeText(link)
                        .then(() => createToastV(eToast.success, "Copied link to clipboard"))
                        .catch(() => createToastV(eToast.error, "Failed to copy link"));
                }
            });
        });
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
            createToastV(eToast.error, "Failed to load feedback data")
        }
    }

    async handleExport() {
        const month = this.dom.elements.selectTime.value;
        await this.api.exportExcelFeedback(month);
    }

    async handleDelete(id) {
        if (!confirm("Are you sure you want to delete this feedback?")) return;

        try {
            await this.api.deleteFeedback(id);
            createToastV(eToast.delete, "Feedback deleted successfully")
            await this.renderFeedback();
        } catch (error) {
            createToastV(eToast.error, "Failed to load feedback data")
        }
    }

    populateEditForm(data) {
        this.dom.elements.nameStudents.textContent = data.studentsAccount?.fullname || 'N/A';
        this.dom.elements.phoneStudents.textContent = data.studentsAccount?.phone || 'No phone number';

        this.dom.elements.radioProgramming.forEach(radio => {
            radio.checked = (radio.value === data.skill);
        });

        this.dom.elements.radioThinking.forEach(radio => {
            radio.checked = (radio.value === data.thinking);
        });

        tinymce.get('EvaluateContent').setContent(data.contentFeedBack || '');
        this.renderSubjectScores(data.subjectScores);
    }

    renderSubjectScores(scores = []) {
        if (!scores.length) {
            this.dom.elements.tableLanguages.innerHTML = `
                <tr><td colspan="3">No subject scores available</td></tr>
            `;
            return;
        }

        this.dom.elements.tableLanguages.innerHTML = scores.map(score => `
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
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Add styl
    // Initialize TinyMCE
    await tinymce.init({
        selector: '#EvaluateContent'
    });

    // Initialize managers
    domManager = new DOMManager();
    apiService = new APIService();
    feedbackManager = new FeedbackManager(domManager, apiService);

    // Set default month
    domManager.elements.selectTime.value = new Date().getMonth() + 1;

    // Initial render
    await feedbackManager.renderFeedback();
});