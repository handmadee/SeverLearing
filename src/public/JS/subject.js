// subject.js

import { LOCALHOST_API_URL } from './config.js';

class SubjectManager {
    constructor() {
        this.init();
        this.initializeEventListeners();
    }

    init() {
        // Khởi tạo các elements chính
        this.modal = document.getElementById('subjectModal');
        this.form = document.getElementById('subjectForm');
        this.toastContainer = document.getElementById('toasts');
        this.nameCodeInput = document.getElementById('nameCode');
        this.describeInput = document.getElementById('describe');
        this.subjectIdInput = document.getElementById('subjectId');
        this.submitBtn = document.getElementById('submitFormBtn');
        this.createBtn = document.getElementById('createSubjectBtn');
    }

    initializeEventListeners() {
        // Event listeners cho các nút và form chính
        this.createBtn?.addEventListener('click', () => this.createSubject());
        this.submitBtn?.addEventListener('click', () => this.submitForm());
        this.form?.addEventListener('submit', (e) => e.preventDefault());

        // Event listeners cho các nút trong bảng
        document.querySelectorAll('.edit-subject').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.subjectId;
                this.editSubject(id);
            });
        });

        document.querySelectorAll('.delete-subject').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.subjectId;
                this.deleteSubject(id);
            });
        });

        // Event listeners cho modal
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => this.hideModal());
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hideModal();
            }
        });

        // Thêm keyboard event để đóng modal với phím Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.hideModal();
            }
        });
    }

    // Toast Notification System
    showToast(type, message) {
        const toast = document.createElement('div');
        const toastId = `toast-${Date.now()}`;

        toast.className = `toast-custom ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-body">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    ${message}
                </div>
                <button type="button" class="toast-close" data-toast-id="${toastId}">
                    <i class="fas fa-times"></i>
                </button>
            </div>`;

        this.toastContainer.appendChild(toast);

        // Add click event for close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn?.addEventListener('click', () => {
            document.getElementById(toastId)?.remove();
        });

        // Auto remove toast
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Modal Management
    showModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.nameCodeInput.focus();
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.form.reset();
    }

    // API Handling
    async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Có lỗi xảy ra khi thực hiện yêu cầu');
            }

            return await response.json();
        } catch (error) {
            this.showToast('error', error.message);
            throw error;
        }
    }

    // CRUD Operations
    createSubject() {
        this.form.reset();
        this.subjectIdInput.value = '';
        this.showModal();
    }

    async editSubject(id) {
        try {
            const data = await this.fetchData(`${LOCALHOST_API_URL}language/${id}`);

            if (data) {
                this.nameCodeInput.value = data.nameCode || '';
                this.describeInput.value = data.describe || '';
                this.subjectIdInput.value = id;
                this.showModal();
            }
        } catch (error) {
            console.error('Error fetching subject:', error);
            this.showToast('error', 'Không thể tải thông tin môn học');
        }
    }

    async deleteSubject(id) {
        if (confirm('Bạn có chắc chắn muốn xoá môn học này không?')) {
            try {
                await this.fetchData(`${LOCALHOST_API_URL}language/${id}`, {
                    method: 'DELETE'
                });

                this.showToast('success', 'Xóa môn học thành công');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error('Error deleting subject:', error);
                this.showToast('error', 'Không thể xóa môn học');
            }
        }
    }

    validateForm() {
        const nameCode = this.nameCodeInput.value.trim();
        const describe = this.describeInput.value.trim();

        if (!nameCode) {
            this.showToast('error', 'Vui lòng nhập tên môn học');
            this.nameCodeInput.focus();
            return false;
        }

        if (!describe) {
            this.showToast('error', 'Vui lòng nhập mô tả môn học');
            this.describeInput.focus();
            return false;
        }

        return true;
    }

    async submitForm() {
        if (!this.validateForm()) return;

        const id = this.subjectIdInput.value;
        const formData = {
            nameCode: this.nameCodeInput.value.trim(),
            describe: this.describeInput.value.trim()
        };

        try {
            const url = id
                ? `${LOCALHOST_API_URL}language/${id}`
                : `${LOCALHOST_API_URL}language`;

            await this.fetchData(url, {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(formData)
            });

            this.showToast('success', `${id ? 'Cập nhật' : 'Thêm'} môn học thành công`);
            this.hideModal();
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showToast('error', `Không thể ${id ? 'cập nhật' : 'thêm'} môn học`);
        }
    }

    // Loading State Management
    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = 'Lưu';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const subjectManager = new SubjectManager();
});

export default SubjectManager;