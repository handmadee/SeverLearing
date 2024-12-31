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
                this.submitExam();
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
        const totalQuestions = this.form.querySelectorAll('[name^="question"]').length / 4;
        const answeredQuestions = answers.filter(answer => answer !== null).length;

        if (answeredQuestions < totalQuestions) {
            const missingQuestions = totalQuestions - answeredQuestions;
            if (!confirm(`Bạn còn ${missingQuestions} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
                return;
            }
        }

        this.submitExam(answers);
    }

    collectAnswers() {
        const answers = [];
        const questions = this.form.querySelectorAll('[name^="question"]');
        const totalQuestions = questions.length / 4;
        for (let i = 0; i < totalQuestions; i++) {
            const selectedOption = this.form.querySelector(`input[name="question${i}"]:checked`);
            answers.push(selectedOption ? selectedOption.value : null);
        }

        return answers;
    }

    showResult(data) {
        document.getElementById('studentId').textContent = data.userRef;
        document.getElementById('examId').textContent = data.examRef;
        document.getElementById('correctAnswers').textContent = data.correctAnswers;
        document.getElementById('totalQuestions').textContent =
            data.correctAnswers + data.incorrectAnswers;

        const examStatus = document.getElementById('examStatus');
        if (data.result) {
            examStatus.textContent = 'Đạt';
            examStatus.className = 'result-status status-pass';
        } else {
            examStatus.textContent = 'Không Đạt';
            examStatus.className = 'result-status status-fail';
        }

        this.resultPopup.classList.add('show');
    }

    async submitExam(answers) {
        try {
            const formData = {
                studentAnswers: answers,
                idExam: document.querySelector('[data-exam-id]').dataset.examId,
                idStudent: document.querySelector('[data-student-id]').dataset.studentId
            };
            const data = await submitExamV(formData);
            console.log(data)
            // const mockResponse = {
            //     status: 201,
            //     message: "Created History Success",
            //     data: {
            //         examRef: "K7FWQE",
            //         userRef: "6693633da1c8c5dd16110d3a",
            //         correctAnswers: 3,
            //         incorrectAnswers: 5,
            //         result: false,
            //         _id: "6773feed7687033dcf22f850",
            //         createdAt: "2024-12-31T14:25:49.547Z",
            //         updatedAt: "2024-12-31T14:25:49.547Z",
            //         __v: 0
            //     }
            // };
            this.showResult(data.data);

        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExamService();
});



// Checkpoins
// class ExamService {
//     constructor() {
//         // Khởi tạo các thuộc tính cơ bản
//         this.form = document.getElementById('examForm');
//         this.submitButton = document.getElementById('submitExam');
//         this.timeRemaining = document.getElementById('timeRemaining');
//         this.examId = document.querySelector('[data-exam-id]').dataset.examId;
//         this.studentId = document.querySelector('[data-student-id]').dataset.studentId;
//         this.initialExamTime = parseInt(document.querySelector('[data-exam-time]').dataset.examTime) * 60;
//         // Keys cho localStorage
//         this.STORAGE_KEYS = {
//             ANSWERS: `exam_answers_${this.examId}`,
//             TIMER: `exam_timer_${this.examId}`,
//             START_TIME: `exam_start_${this.examId}`
//         };

//         this.init();
//     }

//     init() {
//         this.initializeExamState();
//         this.setupFormListeners();
//         this.setupTimer();
//         this.setupWindowListeners();
//     }

//     initializeExamState() {
//         if (!localStorage.getItem(this.STORAGE_KEYS.START_TIME)) {
//             localStorage.setItem(this.STORAGE_KEYS.START_TIME, Date.now());
//             localStorage.setItem(this.STORAGE_KEYS.TIMER, this.initialExamTime);
//             localStorage.setItem(this.STORAGE_KEYS.ANSWERS, JSON.stringify(new Array(this.getTotalQuestions()).fill(null)));
//         }
//         this.restoreAnswers();
//     }

//     getTotalQuestions() {
//         return document.querySelectorAll('[name^="question"]').length / 4;
//     }

//     setupWindowListeners() {
//         window.addEventListener('beforeunload', () => {
//             this.saveCurrentState();
//         });
//         window.addEventListener('load', () => {
//             this.restoreAnswers();
//         });

//         setInterval(() => {
//             this.saveCurrentState();
//         }, 5000);
//     }

//     setupFormListeners() {

//         this.form.addEventListener('change', (e) => {
//             if (e.target.type === 'radio') {
//                 this.saveAnswer(e.target);
//             }
//         });


//         this.submitButton.addEventListener('click', (e) => {
//             e.preventDefault();
//             if (this.validateBeforeSubmit()) {
//                 this.submitExam();
//             }
//         });
//     }

//     saveAnswer(radioElement) {
//         const questionIndex = parseInt(radioElement.name.replace('question', ''));
//         const answers = this.getStoredAnswers();
//         answers[questionIndex] = radioElement.value;
//         localStorage.setItem(this.STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
//     }

//     getStoredAnswers() {
//         return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ANSWERS)) || [];
//     }

//     restoreAnswers() {
//         const savedAnswers = this.getStoredAnswers();
//         savedAnswers.forEach((answer, index) => {
//             if (answer !== null) {
//                 const radio = this.form.querySelector(`input[name="question${index}"][value="${answer}"]`);
//                 if (radio) radio.checked = true;
//             }
//         });
//     }

//     setupTimer() {
//         let timeLeft = parseInt(localStorage.getItem(this.STORAGE_KEYS.TIMER));
//         const startTime = parseInt(localStorage.getItem(this.STORAGE_KEYS.START_TIME));
//         const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
//         timeLeft = Math.max(0, this.initialExamTime - elapsedTime);

//         const timerInterval = setInterval(() => {
//             if (timeLeft <= 0) {
//                 clearInterval(timerInterval);
//                 this.submitExam();
//                 return;
//             }

//             const minutes = Math.floor(timeLeft / 60);
//             const seconds = timeLeft % 60;
//             this.timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
//             localStorage.setItem(this.STORAGE_KEYS.TIMER, timeLeft);
//             timeLeft--;
//         }, 1000);
//     }

//     validateBeforeSubmit() {
//         const answers = this.getStoredAnswers();
//         const unansweredCount = answers.filter(answer => answer === null).length;

//         if (unansweredCount > 0) {
//             return confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`);
//         }
//         return true;
//     }

//     saveCurrentState() {
//         const currentAnswers = this.getStoredAnswers();
//         localStorage.setItem(this.STORAGE_KEYS.ANSWERS, JSON.stringify(currentAnswers));
//     }

//     clearExamData() {
//         // Xóa dữ liệu bài thi khỏi localStorage khi nộp bài
//         Object.values(this.STORAGE_KEYS).forEach(key => {
//             localStorage.removeItem(key);
//         });
//     }

//     submitExam() {
//         const answers = this.getStoredAnswers();
//         // Tạo object chứa dữ liệu nộp bài
//         const submitData = {
//             examId: this.examId,
//             studentId: this.studentId,
//             answers: answers,
//             submittedAt: new Date().toISOString()
//         };

//         // Gửi dữ liệu lên server
//         // fetch('/api/submit-exam', {
//         //     method: 'POST',
//         //     headers: {
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify(submitData)
//         // })
//         //     .then(response => response.json())
//         //     .then(data => {
//         //         if (data.success) {
//         //             this.clearExamData(); // Xóa dữ liệu local khi nộp thành công
//         //             alert('Nộp bài thành công!');
//         //             window.location.href = `/exam-results/${data.resultId}`;
//         //         } else {
//         //             throw new Error(data.message || 'Có lỗi xảy ra');
//         //         }
//         //     })
//         //     .catch(error => {
//         //         console.error('Error submitting exam:', error);
//         //         alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
//         //     });
//     }
// }

// // Khởi tạo khi trang đã load
// document.addEventListener('DOMContentLoaded', () => {
//     new ExamService();
// });