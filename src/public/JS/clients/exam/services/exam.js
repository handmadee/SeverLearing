import { submitExamV } from "../apis/exam.api.js";

class ExamService {
    constructor() {
        this.form = document.getElementById('examForm');
        this.submitButton = document.getElementById('submitExam');
        this.timeRemaining = document.getElementById('timeRemaining');
        this.examTime = parseInt(document.querySelector('[data-exam-time]').dataset.examTime) * 60;
        this.resultPopup = document.getElementById('resultPopup');
        this.init();
    }

    init() {
        this.setupTimer();
        this.setupFormListeners();
        this.setupPopupListeners();
        this.setupGroupSelection();
    }

    setupGroupSelection() {
        const specializationRadios = document.querySelectorAll('input[name="specialization"]');
        const specializedGroups = document.querySelectorAll('.specialized-group');

        // Initially hide all specialized groups
        specializedGroups.forEach(group => {
            group.style.display = 'none';
        });

        // Handle specialization selection
        specializationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedGroup = e.target.value;

                // Hide all specialized groups
                specializedGroups.forEach(group => {
                    group.style.display = 'none';
                });

                // Show selected group
                const selectedElement = document.querySelector(`.specialized-group[data-group="${selectedGroup}"]`);
                if (selectedElement) {
                    selectedElement.style.display = 'block';
                }
            });
        });
    }

    setupPopupListeners() {
        document.getElementById('closePopup').addEventListener('click', () => {
            this.resultPopup.classList.remove('show');
        });

        document.getElementById('backToHome').addEventListener('click', () => {
            window.location.href = '/client/exams/start';
        });
    }

    setupTimer() {
        let timeLeft = this.examTime;
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            this.timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                const answers = this.collectAnswers();
                console.log(answers);
                this.submitExam(answers);
            }
            timeLeft--;
        };

        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer();
    }

    setupFormListeners() {
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.validateAndSubmit();
        });
    }

    validateAndSubmit() {
        const answers = this.collectAnswers();
        if (this.validateAnswers(answers)) {
            this.submitExam(answers);
        }
    }

    validateAnswers(answers) {
        // Validate section 1 (required)
        const unansweredSection1 = answers.section1.filter(answer => answer === null).length;
        if (unansweredSection1 > 0) {
            alert('Vui lòng trả lời tất cả câu hỏi ở phần 1');
            return false;
        }

        // Validate common questions (required)
        const unansweredCommon = answers.section2.common.some(questionAnswers =>
            questionAnswers.some(answer => answer === null)
        );
        if (unansweredCommon) {
            alert('Vui lòng trả lời tất cả câu hỏi phần chung');
            return false;
        }

        // Check if a specialization is selected
        const selectedSpecialization = document.querySelector('input[name="specialization"]:checked');
        if (!selectedSpecialization) {
            alert('Vui lòng chọn chuyên ngành (CS hoặc ITC)');
            return false;
        }

        return true;
    }

    collectAnswers() {
        // Collect section 1 answers (multiple choice)
        const section1Answers = [];
        const totalSection1Questions = this.form.querySelectorAll('[name^="question"]').length / 4;
        for (let i = 0; i < totalSection1Questions; i++) {
            const selectedOption = this.form.querySelector(`input[name="question${i}"]:checked`);
            section1Answers.push(selectedOption ? selectedOption.value : null);
        }

        // Collect common section answers
        const commonAnswers = [];
        const commonQuestions = document.querySelectorAll('[name^="common_q"]');
        for (let i = 0; i < 2; i++) { // 2 common questions
            const questionAnswers = [];
            for (let j = 1; j <= 4; j++) {
                const select = this.form.querySelector(`select[name="common_q${i}_${j}"]`);
                questionAnswers.push(select ? select.value : null);
            }
            commonAnswers.push(questionAnswers);
        }

        // Collect specialized section answers
        const selectedSpecialization = document.querySelector('input[name="specialization"]:checked');
        const specializedAnswers = [];

        if (selectedSpecialization) {
            const type = selectedSpecialization.value; // 'cs' or 'itc'
            const specializedQuestions = document.querySelectorAll(`[name^="${type}_q"]`);

            // Group answers by question
            const questionCount = specializedQuestions.length / 4;
            for (let i = 0; i < questionCount; i++) {
                const questionAnswers = [];
                for (let j = 1; j <= 4; j++) {
                    const select = this.form.querySelector(`select[name="${type}_q${i}_${j}"]`);
                    questionAnswers.push(select ? select.value : null);
                }
                specializedAnswers.push(questionAnswers);
            }
        }

        return {
            section1: section1Answers,
            section2: {
                common: commonAnswers,
                specialized: {
                    type: selectedSpecialization ? selectedSpecialization.value : null,
                    answers: specializedAnswers
                }
            }
        };
    }

    showResult(data) {
        // Hiển thị thông tin cơ bản
        document.getElementById('studentId').textContent = data.userRef;
        document.getElementById('examId').textContent = data.examRef;

        // Hiển thị điểm tổng
        document.getElementById('totalScore').textContent = data.totalScore.toFixed(1);

        // Phần 1: Trắc nghiệm
        const section1 = data.sections.section1;
        document.getElementById('section1Correct').textContent = section1.correctAnswers.length;
        document.getElementById('section1Total').textContent = section1.totalQuestions;

        // Phần 2: Common
        const common = data.sections.section2.common;
        document.getElementById('commonCorrect').textContent = common.correctAnswers.length;
        document.getElementById('commonTotal').textContent = common.totalQuestions;

        // Phần 2: Specialized
        const specialized = data.sections.section2.specialized;
        document.getElementById('specializedCorrect').textContent = specialized.correctAnswers.length;
        document.getElementById('specializedTotal').textContent = specialized.totalQuestions;

        // Thêm class dựa trên điểm số
        const scoreCircle = document.querySelector('.score-circle');
        if (data.totalScore >= 5) {
            scoreCircle.style.borderColor = '#4caf50';
        } else {
            scoreCircle.style.borderColor = '#f44336';
        }

        // Hiển thị popup
        this.resultPopup.classList.add('show');
    }

    async submitExam(answers) {
        try {
            const formData = {
                examRef: document.querySelector('[data-exam-id]').dataset.examId,
                userRef: document.querySelector('[data-student-id]').dataset.studentId,
                answers: answers
            };

            console.log('Submitting exam data:', formData);
            const response = await submitExamV(formData);
            console.log(response)
            this.showResult(response.data);

        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ExamService();
});