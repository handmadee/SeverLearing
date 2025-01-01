'use strict';

import { UTILS } from '../../../untils/untils.js';
import { getAllExams, createdExamApi, changeStatusExam, getHistoryByExamId, updateExamApi, deleteExamApi } from './apis/exam.api.js';

class ExamManager {
    constructor() {
        this.selectedExamId = null;
        this.currentExams = [];
        this.editingExamId = null;
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalPages = 1;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadExams();
    }

    setupElements() {
        this.elements = {
            examForm: document.getElementById('examForm'),
            examModal: document.getElementById('examModal'),
            detailsModal: document.getElementById('detailsModal'),
            answersContainer: document.getElementById('answersContainer'),
            searchExamCode: document.getElementById('searchExamCode'),
            searchExamTitle: document.getElementById('searchExamTitle'),
            examTableBody: document.getElementById('examTableBody'),
            addAnswerBtn: document.getElementById('addAnswerBtn'),
            createExamBtn: document.getElementById('createExamBtn'),
            detailsTableBody: document.getElementById('detailsTableBody'),
            studentSearch: document.getElementById('studentSearch'),
            pageInfo: document.getElementById('pageInfo'),
            closeModalButtons: document.querySelectorAll('.close'),
            paginationContainer: document.getElementById('paginationContainer'),
            resultFilter: document.getElementById('resultFilter'),
            statusFilter: document.getElementById('statusFilter')
        };
    }

    setupEventListeners() {
        // Form events
        this.elements.examForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.addAnswerBtn.addEventListener('click', () => this.addQuestionItem());
        this.elements.createExamBtn.addEventListener('click', () => this.showCreateExamModal());

        // Search events
        this.elements.searchExamCode.addEventListener('input', () => this.handleSearch());
        this.elements.studentSearch.addEventListener('input', () => this.handleStudentSearch());
        this.elements.resultFilter.addEventListener('change', () => this.handlerFilterStudents());
        this.elements.statusFilter.addEventListener('change', () => this.handleSearch());
        this.elements.examTableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (row && !event.target.closest('button')) {
                const examId = row.querySelector('td:first-child').textContent;
                this.copyToClipboard(examId);
                this.showNotification('Đã sao chép mã đề: ' + examId, 'success');
            }
        });
        // Modal close events
        this.elements.closeModalButtons.forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModals());
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Delegated event listeners for dynamic elements
        this.elements.examTableBody.addEventListener('click', (event) => {
            const target = event.target;
            if (target.closest('.view-btn')) {
                const examId = target.closest('button').dataset.examId;
                this.viewExamDetails(examId);
            } else if (target.closest('.edit-btn')) {
                const examId = target.closest('button').dataset.examId;
                this.editExam(examId);
            } else if (target.closest('.delete-btn')) {
                const examId = target.closest('button').dataset.examId;
                this.deleteExam(examId);
            } else if (target.closest('.status-btn')) {
                const examId = target.closest('button').dataset.examId;
                this.toggleExamStatus(examId);
            }
        });

        // Pagination events
        this.elements.paginationContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('page-link')) {
                const page = parseInt(target.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.loadExams();
                }
            }
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .catch(err => {
                console.error('Không thể sao chép vào clipboard:', err);
                this.showNotification('Không thể sao chép mã đề', 'error');
            });
    }

    async loadExams(status, q) {
        try {
            const loadingIndicator = this.showLoadingIndicator();
            const response = await getAllExams({
                page: this.currentPage,
                limit: this.itemsPerPage,
                status,
                search: q
            });
            this.currentExams = response.data.exams;
            this.totalPages = response.data.totalPages;
            this.renderExamTable();
            this.renderPagination();
            loadingIndicator.remove();
        } catch (error) {
            this.showNotification('Lỗi khi tải danh sách đề thi', 'error');
        }
    }

    renderExamTable() {
        if (!this.currentExams.length) {
            this.elements.examTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Không có dữ liệu</td>
            </tr>
        `;
            return;
        }

        this.elements.examTableBody.innerHTML = this.currentExams.map(exam => {
            let count = new Set(exam.examStudentUsed).size;
            return `
        <tr title="Click để sao chép mã đề">
            <td>${exam._id}</td>
            <td>${exam.title}</td>
            <td class="text-center">${count}</td>
            <td>${this.formatDate(exam.createdAt)}</td>
            <td class="action-buttons">
                <button class="action-btn view-btn" data-exam-id="${exam._id}" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" data-exam-id="${exam._id}" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-exam-id="${exam._id}" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="status-btn ${exam.examIsActive ? 'status-active' : 'status-inactive'}" 
                        data-exam-id="${exam._id}"
                        title="${exam.examIsActive ? 'Khóa đề thi' : 'Mở khóa đề thi'}">
                    <i class="fas ${exam.examIsActive ? 'fa-lock-open' : 'fa-lock'}"></i>
                </button>
            </td>
        </tr>
    `
        }).join('');
        const rows = this.elements.examTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.cells.length > 1) {
                row.style.cursor = 'pointer';
                row.classList.add('exam-row');
            }
        });
    }



    renderPagination() {
        const paginationHTML = Array.from({ length: this.totalPages }, (_, i) => {
            const page = i + 1;
            return `
                <li class="page-item ${this.currentPage === page ? 'active' : ''}">
                    <a class="page-link" data-page="${page}" href="#">${page}</a>
                </li>
            `;
        }).join('');

        this.elements.paginationContainer.innerHTML = `
            <nav aria-label="Page navigation">
                <ul class="pagination">
                    <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" data-page="${this.currentPage - 1}" href="#" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    ${paginationHTML}
                    <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                        <a class="page-link" data-page="${this.currentPage + 1}" href="#" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = this.getFormData();

        if (!this.validateForm(formData)) return;

        try {
            const loadingIndicator = this.showLoadingIndicator();
            if (this.editingExamId) {
                await updateExamApi(this.editingExamId, formData);
                this.showNotification('Cập nhật đề thi thành công!', 'success');
            } else {
                await createdExamApi(formData);
                this.showNotification('Tạo đề thi mới thành công!', 'success');
            }
            loadingIndicator.remove();
            this.closeModals();
            this.resetForm();
            await this.loadExams();
        } catch (error) {
            this.showNotification('Đã xảy ra lỗi khi lưu đề thi', 'error');
        }
    }

    getFormData() {
        return {
            title: this.elements.examForm.querySelector('#examTitle').value.trim(),
            linkTopic: this.elements.examForm.querySelector('#examLink').value.trim(),
            answers: this.getAnswersFromForm(),
            expTime: parseInt(this.elements.examForm.querySelector('#examTime').value),
            limitUser: parseInt(this.elements.examForm.querySelector('#examLimit').value) || 1
        };
    }

    getAnswersFromForm() {
        const answers = [];
        this.elements.answersContainer.querySelectorAll('.question-item').forEach(item => {
            const selectedOption = item.querySelector('input[type="radio"]:checked');
            if (selectedOption) {
                answers.push(selectedOption.value);
            }
        });
        return answers;
    }

    validateForm(data) {
        if (!data.title) {
            this.showNotification('Vui lòng nhập tên đề thi', 'error');
            return false;
        }
        if (!data.linkTopic) {
            this.showNotification('Vui lòng nhập link topic', 'error');
            return false;
        }
        if (!data.answers.length) {
            this.showNotification('Vui lòng thêm ít nhất một câu hỏi', 'error');
            return false;
        }
        if (data.expTime < 1) {
            this.showNotification('Thời gian làm bài phải lớn hơn 0', 'error');
            return false;
        }
        return true;
    }

    addQuestionItem(selectedAnswer = null) {
        const questionNumber = this.elements.answersContainer.children.length + 1;
        const questionHTML = `
            <div class="question-item" data-question="${questionNumber}">
                <div class="question-header">
                    <span class="question-number">Câu ${questionNumber}</span>
                    <button type="button" class="remove-question-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="answer-options">
                    ${['A', 'B', 'C', 'D'].map(option => `
                        <div class="option">
                            <input type="radio" id="q${questionNumber}_${option}" 
                                   name="question_${questionNumber}" value="${option}" ${selectedAnswer === option ? 'checked' : ''} required>
                            <label for="q${questionNumber}_${option}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.elements.answersContainer.insertAdjacentHTML('beforeend', questionHTML);

        // Attach event listener for remove button
        const removeButton = this.elements.answersContainer.querySelector(`[data-question="${questionNumber}"] .remove-question-btn`);
        removeButton.addEventListener('click', () => this.removeQuestionItem(questionNumber));
    }

    removeQuestionItem(questionNumber) {
        const questionElement = document.querySelector(`[data-question="${questionNumber}"]`);
        if (questionElement) {
            questionElement.remove();
            this.updateQuestionNumbers();
        }
    }

    updateQuestionNumbers() {
        const questions = this.elements.answersContainer.querySelectorAll('.question-item');
        questions.forEach((item, index) => {
            const newNumber = index + 1;
            item.dataset.question = newNumber;
            item.querySelector('.question-number').textContent = `Câu ${newNumber}`;
            const inputs = item.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.name = `question_${newNumber}`;
                input.id = input.id.replace(/q\d+/, `q${newNumber}`);
            });
            const labels = item.querySelectorAll('label');
            labels.forEach(label => {
                label.setAttribute('for', label.getAttribute('for').replace(/q\d+/, `q${newNumber}`));
            });
        });
    }

    handlerFilterStudents() {
        const filterValue = this.elements.resultFilter.value.trim();
        const rows = this.elements.detailsTableBody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            // Bỏ qua các hàng không hợp lệ
            if (row.cells.length < 5) return;
            const resultBadge = row.querySelector('.badge');
            if (!resultBadge) return;
            const resultText = resultBadge.dataset.status;
            console.log(resultText)
            if (filterValue === 'all') {
                row.style.display = '';
                visibleCount++;
            } else {
                const shouldShow = resultText == filterValue;
                row.style.display = shouldShow ? '' : 'none';
                if (shouldShow) visibleCount++;
            }
        });

        // Cập nhật số lượng kết quả hiển thị
        this.updateResultsCount(visibleCount);
    }

    updateResultsCount(visibleCount) {
        const currentResults = document.getElementById('currentResults');
        const totalResults = document.getElementById('totalResults');

        if (currentResults && totalResults) {
            const totalCount = this.elements.detailsTableBody.querySelectorAll('tr').length;
            currentResults.textContent = visibleCount;
            totalResults.textContent = totalCount;
        }
    }


    async viewExamDetails(examId, status) {
        try {
            const loadingIndicator = this.showLoadingIndicator();
            const historyData = await getHistoryByExamId(examId);
            console.log(historyData)
            document.getElementById('examDetailId').textContent = examId
            this.renderExamDetails(historyData.data);
            this.elements.detailsModal.style.display = 'block';
            loadingIndicator.remove();
        } catch (error) {
            console.log(error)
            this.showNotification('Lỗi khi tải chi tiết đề thi', 'error');
        }
    }

    renderExamDetails(historyData) {
        this.elements.detailsTableBody.innerHTML = historyData.length ?
            historyData.map(record => `
                <tr>
                     <td>${record?.userRef?._id}</td>
                    <td>${record?.userRef?.fullname}</td>
                    <td class="text-center">${record.correctAnswers}</td>
                    <td class="text-center">${record.incorrectAnswers}</td>
                    <td class="text-center">
                        <span data-status="${record.result}" class="badge ${record.result ? 'bg-success' : 'bg-danger'}">
                            ${record.result ? 'Đạt' : 'Không đạt'}
                        </span>
                    </td>
                      <td class="text-center">${UTILS.formatDate(record.createdAt)}</td>
                </tr>
            `).join('') :
            '<tr><td colspan="4" class="text-center">Chưa có dữ liệu</td></tr>';
    }

    async editExam(examId) {
        const exam = this.currentExams.find(e => e._id === examId);
        if (!exam) return;

        this.editingExamId = examId;
        this.populateForm(exam);
        this.elements.examModal.style.display = 'block';
    }

    populateForm(exam) {
        const { title, linkTopic, answers, expTime, limitUser } = exam;
        this.elements.examForm.querySelector('#examTitle').value = title;
        this.elements.examForm.querySelector('#examLink').value = linkTopic;
        this.elements.examForm.querySelector('#examTime').value = expTime;
        this.elements.examForm.querySelector('#examLimit').value = limitUser;

        // Clear and rebuild answers
        this.elements.answersContainer.innerHTML = '';
        answers.forEach(answer => {
            this.addQuestionItem(answer);
        });
    }

    async deleteExam(examId) {
        if (confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
            try {
                await deleteExamApi(examId);
                await this.loadExams();
                this.showNotification('Đề thi đã được xóa thành công', 'success');
            } catch (error) {
                this.showNotification('Lỗi khi xóa đề thi', 'error');
            }
        }
    }

    async toggleExamStatus(examId) {
        try {
            console.log(examId)
            await changeStatusExam(examId);
            await this.loadExams();
            this.showNotification('Trạng thái đề thi đã được cập nhật', 'success');
        } catch (error) {
            this.showNotification('Lỗi khi thay đổi trạng thái đề thi', 'error');
        }
    }

    showCreateExamModal() {
        this.editingExamId = null;
        this.resetForm();
        this.elements.examModal.style.display = 'block';
    }

    resetForm() {
        this.elements.examForm.reset();
        this.elements.answersContainer.innerHTML = '';
        this.editingExamId = null;
        this.addQuestionItem();
    }

    closeModals() {
        this.elements.examModal.style.display = 'none';
        this.elements.detailsModal.style.display = 'none';
    }

    handleSearch() {
        const codeSearch = this.elements.searchExamCode.value.toLowerCase();
        console.log(codeSearch)
        const statusFilter = this.elements.statusFilter.value;
        this.loadExams(statusFilter, codeSearch);
    }

    handleStudentSearch() {
        const searchValue = this.elements.studentSearch.value.toLowerCase();
        const rows = this.elements.detailsTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const studentName = row.cells[1].textContent.toLowerCase();
            row.style.display = studentName.includes(searchValue) ? '' : 'none';
        });
    }

    formatDate(dateString) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    showLoadingIndicator() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loadingIndicator);
        return loadingIndicator;
    }

    showNotification(message, type = 'info') {
        const notificationTypes = {
            success: 'background-color: #4caf50; color: white;',
            error: 'background-color: #f44336; color: white;',
            info: 'background-color: #2196f3; color: white;'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            z-index: 1000;
            ${notificationTypes[type] || notificationTypes.info}
        `;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

let examManager;
document.addEventListener('DOMContentLoaded', () => {
    examManager = new ExamManager();
    window.examManager = examManager;

    const style = document.createElement('style');
    style.textContent = `
    .exam-row:hover {
        background-color: #f5f5f5;
        transition: background-color 0.2s ease;
    }
`;
    document.head.appendChild(style);
});