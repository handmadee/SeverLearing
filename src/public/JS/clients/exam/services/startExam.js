
'use strict';

import { showAlert } from "../../../Aleart.js";
import { startExamApi, checkExamApi } from "../apis/exam.api.js";


document.addEventListener('DOMContentLoaded', () => {
    const confirmStartExamModal = document.getElementById('confirmStartExamModal');
    const cancel = document.getElementById('cancelButton');
    const close = document.getElementById('close');
    const confirmStartButton = document.getElementById('confirmStartButton');
    cancel.addEventListener('click', () => {
        confirmStartExamModal.classList.remove('show')
    })
    close.addEventListener('click', () => {
        confirmStartExamModal.classList.remove('show')
    })
    confirmStartButton.addEventListener('click', () => {
        let hast = false;
        const examCode = document.getElementById('examCode').value.trim();
        const studentCode = document.getElementById('studentCode').value.trim();
        // let isCheck = localStorage.getItem(`exam_start_${examCode}`);
        // if (
        //     isCheck
        // ) {
        //     hast = true;
        // }
        window.location.href = `/client/exams/online/${examCode}/${studentCode}`;
    })
    // Elements trong modal
    const studentNameSpan = document.getElementById('studentName');
    const examNameSpan = document.getElementById('examName');
    const examDurationSpan = document.getElementById('examDuration');
    const examQuestionsSpan = document.getElementById('examQuestions');
    document.getElementById('examForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const examCode = document.getElementById('examCode').value.trim();
        const studentCode = document.getElementById('studentCode').value.trim();
        if (examCode === '' || studentCode === '') {
            showAlert('Vui lòng điền đầy đủ Mã đề thi và Mã số học sinh.', 'danger');
            return;
        }
        try {
            const result = await checkExamApi(examCode, studentCode);
            if (result.status == 200) {
                showAlert('Bắt đầu thi thành công!', 'success');
                const data = await result.json();
                // window.location.href = `/exam/${result.examId}/start`;
                // Cập nhật thông tin vào modal
                let lenthAnswer = data.data.exam.answers.length;
                studentNameSpan.textContent = data.data.student
                    .fullname;
                examNameSpan.textContent = data.data.exam.title;
                examDurationSpan.textContent = data.data.exam.expTime;
                examQuestionsSpan.textContent = lenthAnswer;
                confirmStartExamModal.classList.add('show');
            }
            else {
                if (result.status == 403) return showAlert('Sinh viên đã đạt giới hạn được phép làm bài kiểm tra', 'danger');
                showAlert(result.message || 'Mã số sinh viên hoặc Mã đề thi không tồn tại.', 'danger');
            }
        } catch (error) {
            showAlert(error.message || 'Đã xảy ra lỗi!', 'danger');
        }
    });
})

