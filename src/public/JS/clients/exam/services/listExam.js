import { getAllExams } from "../apis/exam.api.js";

class ExamListService {
    constructor() {
        this.page = 1;
        this.loading = false;
        this.hasMore = true;
        this.searchTerm = '';
        this.clickCount = {};
        this.clickTimer = {};
        this.init();
    }

    init() {
        this.tableBody = document.getElementById('examTableBody');
        this.searchInput = document.getElementById('searchExamCode');
        this.searchButton = document.getElementById('searchButton');
        this.loadingIndicator = document.getElementById('loading');
        this.setupEventListeners();
        this.loadExams();
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            if (this.isNearBottom() && !this.loading && this.hasMore) {
                this.loadExams();
            }
        });

        this.searchButton.addEventListener('click', () => this.searchExams());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchExams();
            }
        });
    }

    isNearBottom() {
        return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
    }

    async searchExams() {
        this.page = 1;
        this.hasMore = true;
        this.searchTerm = this.searchInput.value.trim();
        this.tableBody.innerHTML = '';
        await this.loadExams();
    }

    createCustomModal(examId) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h5>Xác nhận làm bài</h5>
                    <button class="close-button">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn làm bài thi này?</p>
                </div>
                <div class="modal-footer">
                    <button class="cancel-button">Hủy bỏ</button>
                    <button class="confirm-button">Bắt đầu làm bài</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .custom-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 20px;
                border-radius: 5px;
                max-width: 400px;
                width: 90%;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .close-button {
                border: none;
                background: none;
                font-size: 20px;
                cursor: pointer;
            }
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            .cancel-button, .confirm-button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .cancel-button {
                background: #6c757d;
                color: white;
            }
            .confirm-button {
                background: #007bff;
                color: white;
            }
        `;
        document.head.appendChild(style);

        // Event listeners
        const closeButton = modal.querySelector('.close-button');
        const cancelButton = modal.querySelector('.cancel-button');
        const confirmButton = modal.querySelector('.confirm-button');

        closeButton.onclick = () => modal.remove();
        cancelButton.onclick = () => modal.remove();
        confirmButton.onclick = () => {
            window.location.href = `/client/exams/start?examId=${examId}`;
        };

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = `
            <div class="toast-content ${type}">
                ${message}
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .custom-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            .toast-content {
                padding: 12px 24px;
                border-radius: 4px;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease-in-out;
            }
            .toast-content.error {
                background-color: #dc3545;
            }
            .toast-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => toast.remove(), 3000);

        // Close button handler
        toast.querySelector('.toast-close').onclick = () => toast.remove();
    }

    handleExamClick(examId, isActive) {
        if (!isActive) {
            this.showToast('Bài thi này hiện không khả dụng', 'error');
            return;
        }

        if (!this.clickCount[examId]) {
            this.clickCount[examId] = 1;
            this.clickTimer[examId] = setTimeout(() => {
                this.clickCount[examId] = 0;
            }, 300);
            return;
        }

        clearTimeout(this.clickTimer[examId]);
        this.clickCount[examId] = 0;
        this.createCustomModal(examId);
    }

    async loadExams() {
        if (this.loading) return;

        this.loading = true;
        this.loadingIndicator.classList.remove('d-none');

        try {
            const response = await getAllExams();
            const data = response.data;
            if (data.exams.length === 0) {
                this.hasMore = false;
                if (this.page === 1) {
                    this.tableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center py-4">
                                <div class="text-muted">
                                    <i class="fas fa-search fa-2x mb-3"></i>
                                    <p>Không tìm thấy bài thi nào</p>
                                </div>
                            </td>
                        </tr>`;
                }
                return;
            }

            this.renderExams(data.exams);
            this.page++;
            this.hasMore = this.page <= data.totalPages;

        } catch (error) {
            console.error('Error loading exams:', error);
            this.showToast('Đã có lỗi xảy ra khi tải danh sách bài thi', 'error');
        } finally {
            this.loading = false;
            this.loadingIndicator.classList.add('d-none');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderExams(exams) {
        const rows = exams.map(exam => `
            <tr class="exam-row ${!exam.examIsActive ? 'text-muted' : ''}" data-exam-id="${exam._id}">
                <td class="text-center fw-bold">${exam._id}</td>
                <td class="text-center">${exam.title || 'Chưa có tiêu đề'}</td>
                <td class="text-center">${this.formatDate(new Date())}</td>
                <td class="text-center">
                    <span class="status-badge ${exam.examIsActive ? 'active' : 'inactive'}">
                        ${exam.examIsActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </td>
            </tr>
        `).join('');

        // Add styles for status badges
        const style = document.createElement('style');
        style.textContent = `
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            .status-badge.active {
                background-color: #28a745;
                color: white;
            }
            .status-badge.inactive {
                background-color: #dc3545;
                color: white;
            }
        `;
        document.head.appendChild(style);

        this.tableBody.insertAdjacentHTML('beforeend', rows);

        const newRows = this.tableBody.querySelectorAll('.exam-row');
        newRows.forEach(row => {
            const examId = row.dataset.examId;
            const isActive = row.querySelector('.status-badge').classList.contains('active');

            row.addEventListener('click', () => this.handleExamClick(examId, isActive));
            row.style.cursor = isActive ? 'pointer' : 'not-allowed';

            if (!isActive) {
                row.title = 'Bài thi này hiện không khả dụng';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ExamListService();
});