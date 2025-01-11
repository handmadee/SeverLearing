
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
        this.multipleChoiceCount = 0;
        this.trueFalseCount = 0;
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
            searchExamCode: document.getElementById('searchExamCode'),
            examTableBody: document.getElementById('examTableBody'),
            addAnswerBtn: document.getElementById('addMultipleChoiceBtn'),
            createExamBtn: document.getElementById('createExamBtn'),
            detailsTableBody: document.getElementById('detailsTableBody'),
            studentSearch: document.getElementById('studentSearch'),
            pageInfo: document.getElementById('pageInfo'),
            closeModalButtons: document.querySelectorAll('.close'),
            paginationContainer: document.getElementById('paginationContainer'),
            resultFilter: document.getElementById('resultFilter'),
            statusFilter: document.getElementById('statusFilter'),
            multipleChoiceContainer: document.getElementById('multipleChoiceContainer'),
            trueFalseContainer: document.getElementById('trueFalseContainer'),
            // addTrueFalseBtn: document.getElementById('addTrueFalseBtn')
        };
    }

    setupEventListeners() {
        // Form events
        this.elements.examForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.addAnswerBtn.addEventListener('click', () => this.addMultipleChoiceQuestion());
        this.elements.createExamBtn.addEventListener('click', () => this.showCreateExamModal());
        // this.elements.addTrueFalseBtn.addEventListener('click', () => this.addTrueFalseQuestion());

        this.elements.multipleChoiceContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-question-btn')) {
                const questionItem = e.target.closest('.question-item');
                if (questionItem) {
                    this.removeMultipleChoiceQuestion(questionItem);
                }
            }
        });

        this.elements.trueFalseContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-question-btn')) {
                const questionItem = e.target.closest('.true-false-item');
                if (questionItem) {
                    this.removeTrueFalseQuestion(questionItem);
                }
            }
        });

        // From
        document.getElementById('addCommonQuestionBtn').addEventListener('click', () => {
            this.addTrueFalseQuestion('common');
        });

        document.getElementById('addCSQuestionBtn').addEventListener('click', () => {
            this.addTrueFalseQuestion('cs');
        });

        document.getElementById('addITCQuestionBtn').addEventListener('click', () => {
            this.addTrueFalseQuestion('itc');
        });

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

        this.elements.detailsModal.querySelector('.close').addEventListener('click', () => {
            this.closeModalsDetail();
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





        const incorrectModal = document.getElementById('incorrectAnswersModal');
        incorrectModal.querySelector('.close').addEventListener('click', () => {
            incorrectModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === incorrectModal) {
                incorrectModal.style.display = 'none';
            }
        });



    }

    removeMultipleChoiceQuestion(questionItem) {
        questionItem.remove();
        this.updateMultipleChoiceNumbers();
        this.multipleChoiceCount--;
    }

    removeTrueFalseQuestion(questionItem) {
        const type = questionItem.getAttribute('data-type');
        questionItem.remove();
        this.updateTrueFalseNumbers(type);
        this.trueFalseCount--;
    }

    updateMultipleChoiceNumbers() {
        const questions = this.elements.multipleChoiceContainer.querySelectorAll('.question-item');
        questions.forEach((item, index) => {
            const newNumber = index + 1;
            item.dataset.question = newNumber;

            // Update question number display
            const numberDisplay = item.querySelector('.question-number');
            if (numberDisplay) {
                numberDisplay.textContent = `Câu ${newNumber}`;
            }

            // Update radio button names and IDs
            const radioButtons = item.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                const oldName = radio.getAttribute('name');
                const oldId = radio.getAttribute('id');
                const option = oldId.slice(-1); // Get the last character (A, B, C, or D)

                radio.setAttribute('name', `mc_question_${newNumber}`);
                radio.setAttribute('id', `q${newNumber}_${option}`);

                // Update corresponding label
                const label = item.querySelector(`label[for="${oldId}"]`);
                if (label) {
                    label.setAttribute('for', `q${newNumber}_${option}`);
                }
            });
        });
    }

    updateTrueFalseNumbers(type) {
        const questions = this.elements.trueFalseContainer.querySelectorAll(`.true-false-item[data-type="${type}"]`);
        questions.forEach((item, index) => {
            const newNumber = index + 1;
            item.dataset.question = newNumber;

            // Update question number display
            const typeLabel = type === 'common' ? 'Câu hỏi chung' : type.toUpperCase();
            const numberDisplay = item.querySelector('.question-number');
            if (numberDisplay) {
                numberDisplay.textContent = `${typeLabel} - Câu ${newNumber}`;
            }

            // Update select names
            const selects = item.querySelectorAll('select');
            selects.forEach((select, selectIndex) => {
                select.setAttribute('name', `${type}_q${newNumber}_${selectIndex + 1}`);
            });
        });
    }


    addMultipleChoiceQuestion(selectedAnswer = null) {
        this.multipleChoiceCount++;
        const questionHTML = `
            <div class="question-item" data-question="${this.multipleChoiceCount}">
                <div class="question-header">
                    <span class="question-number">Câu ${this.multipleChoiceCount}</span>
                    <button type="button" class="remove-question-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="answer-options">
                    ${['A', 'B', 'C', 'D'].map(option => `
                        <div class="option">
                            <input type="radio" 
                                   id="q${this.multipleChoiceCount}_${option}" 
                                   name="mc_question_${this.multipleChoiceCount}" 
                                   value="${option}" 
                                   ${selectedAnswer === option ? 'checked' : ''} 
                                   required>
                            <label for="q${this.multipleChoiceCount}_${option}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.elements.multipleChoiceContainer.insertAdjacentHTML('beforeend', questionHTML);
    }

    addTrueFalseQuestion(type = 'common', selectedAnswers = ['Đ', 'Đ', 'Đ', 'Đ']) {
        this.trueFalseCount++;
        const typeLabel = type === 'common' ? 'Câu hỏi chung' : type.toUpperCase();
        const questionHTML = `
        <div class="true-false-item" data-question="${this.trueFalseCount}" data-type="${type}">
            <div class="question-header">
                <span class="question-number">${typeLabel} - Câu ${this.trueFalseCount}</span>
                <button type="button" class="remove-question-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="true-false-options">
                ${[1, 2, 3, 4].map((num, index) => `
                    <div class="true-false-option">
                        <select name="${type}_q${this.trueFalseCount}_${num}" required>
                            <option value="Đ" ${selectedAnswers[index] === 'Đ' ? 'selected' : ''}>Đúng</option>
                            <option value="S" ${selectedAnswers[index] === 'S' ? 'selected' : ''}>Sai</option>
                        </select>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
        this.elements.trueFalseContainer.insertAdjacentHTML('beforeend', questionHTML);
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

        console.log(formData);
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
        const title = this.elements.examForm.querySelector('#examTitle').value.trim();
        const linkTopic = this.elements.examForm.querySelector('#examLink').value.trim();
        const expTime = parseInt(this.elements.examForm.querySelector('#examTime').value);
        const limitUser = parseInt(this.elements.examForm.querySelector('#examLimit').value) || 1;

        // Get multiple choice answers (Section 1)
        const multipleChoiceAnswers = Array.from(this.elements.multipleChoiceContainer.querySelectorAll('.question-item'))
            .map((item, index) => {
                const selected = item.querySelector('input[type="radio"]:checked');
                return {
                    id: index + 1,
                    correctAnswer: selected ? selected.value : null
                };
            });

        // Get common questions (Section 2)
        const commonQuestions = Array.from(this.elements.trueFalseContainer.querySelectorAll('.true-false-item[data-type="common"]'))
            .map((item, index) => {
                const answers = Array.from(item.querySelectorAll('select'))
                    .map(select => select.value);
                return {
                    id: index + 1,
                    correctAnswers: answers
                };
            });

        // Get specialized questions (CS and ITC)
        const csQuestions = Array.from(this.elements.trueFalseContainer.querySelectorAll('.true-false-item[data-type="cs"]'))
            .map((item, index) => {
                const answers = Array.from(item.querySelectorAll('select'))
                    .map(select => select.value);
                return {
                    id: index + 1,
                    correctAnswers: answers
                };
            });

        const itcQuestions = Array.from(this.elements.trueFalseContainer.querySelectorAll('.true-false-item[data-type="itc"]'))
            .map((item, index) => {
                const answers = Array.from(item.querySelectorAll('select'))
                    .map(select => select.value);
                return {
                    id: index + 1,
                    correctAnswers: answers
                };
            });

        return {
            title,
            linkTopic,
            expTime,
            limitUser,
            answers: {
                section1: {
                    questions: multipleChoiceAnswers
                },
                section2: {
                    common: {
                        questions: commonQuestions
                    },
                    private: {
                        cs: {
                            questions: csQuestions
                        },
                        itc: {
                            questions: itcQuestions
                        }
                    }
                }
            }
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
        if (!data.answers.section1.questions.length) {
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

    calculateCommonCorrect = (commonSection) => {
        let correctAnswers = 0;
        correctAnswers += commonSection.correctAnswers.length * 4;
        commonSection.incorrectAnswers.forEach(question => {
            correctAnswers += (4 - question.wrongAnswers.length);
        });

        return correctAnswers;
    };

    calculateSpecializedCorrect = (specializedSection) => {
        let correctAnswers = 0;
        correctAnswers += specializedSection.correctAnswers.length * 4;
        specializedSection.incorrectAnswers.forEach(question => {
            correctAnswers += (4 - question.wrongAnswers.length);
        });

        return correctAnswers;
    };
    renderExamDetails(historyData) {
        this.elements.detailsTableBody.innerHTML = historyData.length ?
            historyData.map(record => {
                const section1Correct = record.sections.section1.correctAnswers.length;
                const section1Total = record.sections.section1.totalQuestions;
                const section2CommonTotal = record.sections.section2.common.totalQuestions * 4;
                const section2CommonCorrect = this.calculateCommonCorrect(record.sections.section2.common);
                const section2SpecializedTotal = record.sections.section2.specialized.totalQuestions * 4;
                const section2SpecializedCorrect = this.calculateSpecializedCorrect(record.sections.section2.specialized);
                const totalCorrect = section1Correct + section2CommonCorrect + section2SpecializedCorrect;
                const totalQuestions = section1Total + section2CommonTotal + section2SpecializedTotal;
                const totalIncorrect = totalQuestions - totalCorrect;
                return (
                    `
            <tr>
                <td>${record?.userRef?._id}</td>
                <td>${record?.userRef?.fullname}</td>
                <td class="text-center">${totalCorrect}</td>
                <td class="text-center">${totalIncorrect}</td>
                <td class="text-center">
                    <span data-status="${record.result}" class="badge ${record.result ? 'bg-success' : 'bg-danger'}">
                        ${record.totalScore}
                    </span>
                </td>
                <td class="text-center">${UTILS.formatDate(record.createdAt)}</td>
                <td class="text-center">
                    <button class="btn btn-info view-details-btn" 
                            data-student-id="${record?.userRef?._id}"
                            data-student-name="${record?.userRef?.fullname}"
                                data-record='${JSON.stringify(record)}'>
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                </td>
            </tr>
                `
                )
            }

            ).join('') :
            '<tr><td colspan="7" class="text-center">Chưa có dữ liệu</td></tr>';
        this.addDetailButtonListeners();
    }

    addDetailButtonListeners() {
        const detailButtons = this.elements.detailsTableBody.querySelectorAll('.view-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.studentId;
                const studentName = e.currentTarget.dataset.studentName;
                const incorrectAnswers = JSON.parse(e.currentTarget.dataset.record);
                this.showAnswerDetails(studentId, studentName, incorrectAnswers);
            });
        });
    }

    async editExam(examId) {
        const exam = this.currentExams.find(e => e._id === examId);
        if (!exam) return;

        this.editingExamId = examId;
        this.populateForm(exam);
        this.elements.examModal.style.display = 'block';
    }

    populateForm(exam) {
        this.multipleChoiceCount = 0;
        this.elements.examForm.querySelector('#examTitle').value = exam.title;
        this.elements.examForm.querySelector('#examLink').value = exam.linkTopic;
        this.elements.examForm.querySelector('#examTime').value = exam.expTime;
        this.elements.examForm.querySelector('#examLimit').value = exam.limitUser;

        // Clear existing questions
        this.elements.multipleChoiceContainer.innerHTML = '';
        this.elements.trueFalseContainer.innerHTML = '';

        // Add multiple choice questions
        exam.answers.section1.questions.forEach(question => {
            this.addMultipleChoiceQuestion(question.correctAnswer);
        });

        // Add common questions
        exam.answers.section2.common.questions.forEach(question => {
            this.addTrueFalseQuestion('common', question.correctAnswers);
        });

        // Add CS questions
        exam.answers.section2.private.cs.questions.forEach(question => {
            this.addTrueFalseQuestion('cs', question.correctAnswers);
        });

        // Add ITC questions
        exam.answers.section2.private.itc.questions.forEach(question => {
            this.addTrueFalseQuestion('itc', question.correctAnswers);
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
        this.elements.multipleChoiceContainer.innerHTML = '';
        this.elements.trueFalseContainer.innerHTML = '';
        this.multipleChoiceCount = 0;
        this.trueFalseCount = 0;
        this.editingExamId = null;
        this.addMultipleChoiceQuestion();
        this.addTrueFalseQuestion();
    }

    closeModals() {
        this.elements.examModal.style.display = 'none';
    }

    closeModalsDetail() {
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

    showAnswerDetails(studentId, studentName, result) {
        // Cập nhật thông tin học sinh
        document.getElementById('studentNameDetail').textContent = studentName;
        document.getElementById('studentIdDetail').textContent = studentId;

        // Hiển thị tổng điểm
        const scoreDisplay = document.getElementById('totalScoreDetail');
        scoreDisplay.textContent = result.totalScore.toFixed(2);
        scoreDisplay.className = result.totalScore >= 5 ? 'score-pass' : 'score-fail';

        // Phần 1: Trắc nghiệm
        const section1 = result.sections.section1;
        const section1Correct = section1.correctAnswers.length;
        const section1Total = section1.totalQuestions;

        document.getElementById('section1Score').innerHTML = `
        <div class="score-detail">
            <div class="score-fraction">${section1Correct}/${section1Total}</div>
            <div class="score-percentage">${((section1Correct / section1Total) * 100).toFixed(1)}%</div>
        </div>
    `;

        // Hiển thị chi tiết câu sai phần 1
        document.getElementById('section1Wrong').innerHTML = `
        <div class="detail-section">
            <h6 class="detail-subtitle">
                <i class="fas fa-times-circle text-danger"></i> 
                Câu trả lời sai (${section1.incorrectAnswers.length})
            </h6>
            <div class="answers-container">
                ${section1.incorrectAnswers.map(wrong => `
                    <div class="answer-item">
                        <div class="question-number">Câu ${wrong.questionNumber}</div>
                        <div class="answer-details">
                            <div class="student-answer">
                                <i class="fas fa-user"></i> Đã chọn: 
                                <span class="badge bg-danger-subtle text-danger">
                                    ${wrong.studentAnswer || 'Không trả lời'}
                                </span>
                            </div>
                            <div class="correct-answer">
                                <i class="fas fa-check"></i> Đáp án: 
                                <span class="badge bg-success-subtle text-success">
                                    ${wrong.correctAnswer}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

        // Phần 2: Common
        const commonSection = result.sections.section2.common;
        const commonTotal = commonSection.totalQuestions * 4;
        const commonCorrect = this.calculateCommonCorrect(commonSection);

        document.getElementById('commonScore').innerHTML = `
        <div class="score-detail">
            <div class="score-fraction">${commonCorrect}/${commonTotal}</div>
            <div class="score-percentage">${((commonCorrect / commonTotal) * 100).toFixed(1)}%</div>
        </div>
    `;

        // Hiển thị chi tiết câu sai phần common
        document.getElementById('commonWrong').innerHTML = `
        <div class="detail-section">
            <h6 class="detail-subtitle">
                <i class="fas fa-exclamation-triangle text-warning"></i> 
                Câu trả lời sai
            </h6>
            <div class="answers-container">
                ${commonSection.incorrectAnswers.map(question => `
                    <div class="answer-item">
                        <div class="question-number">Câu ${question.questionNumber}</div>
                        <div class="sub-answers">
                            ${question.wrongAnswers.map(wrong => `
                                <div class="sub-answer-item">
                                    <div class="sub-question">Ý ${wrong.subQuestionNumber}</div>
                                    <div class="answer-pair">
                                        <span class="answer wrong">
                                            <i class="fas fa-times"></i> 
                                            ${wrong.studentAnswer || 'Không trả lời'}
                                        </span>
                                        <span class="answer correct">
                                            <i class="fas fa-check"></i> 
                                            ${wrong.correctAnswer}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

        // Phần 2: Specialized
        const specializedSection = result.sections.section2.specialized;
        const specializedTotal = specializedSection.totalQuestions * 4;
        const specializedCorrect = this.calculateSpecializedCorrect(specializedSection);

        document.getElementById('specializedScore').innerHTML = `
        <div class="score-detail">
            <div class="score-fraction">${specializedCorrect}/${specializedTotal}</div>
            <div class="score-percentage">${((specializedCorrect / specializedTotal) * 100).toFixed(1)}%</div>
        </div>
    `;

        // Hiển thị chi tiết câu sai phần specialized
        document.getElementById('specializedWrong').innerHTML = `
        <div class="detail-section">
            <h6 class="detail-subtitle">
                <i class="fas fa-code text-primary"></i> 
            </h6>
            <div class="answers-container">
                ${specializedSection.incorrectAnswers.map(question => `
                    <div class="answer-item">
                        <div class="question-number">Câu ${question.questionNumber}</div>
                        <div class="sub-answers">
                            ${question.wrongAnswers.map(wrong => `
                                <div class="sub-answer-item">
                                    <div class="sub-question">Ý ${wrong.subQuestionNumber}</div>
                                    <div class="answer-pair">
                                        <span class="answer wrong">
                                            <i class="fas fa-times"></i> 
                                            ${wrong.studentAnswer || 'Không trả lời'}
                                        </span>
                                        <span class="answer correct">
                                            <i class="fas fa-check"></i> 
                                            ${wrong.correctAnswer}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

        document.getElementById('incorrectAnswersModal').style.display = 'block';
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


