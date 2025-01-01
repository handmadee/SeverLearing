import { UTILS } from "../../../../untils/untils.js";
import { getHistoryExam } from "../apis/exam.api.js";

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        form: document.getElementById('searchForm'),
        examCode: document.getElementById('searchExamCode'),
        studentId: document.getElementById('searchStudentId'),
        tableBody: document.getElementById('examTableBody')
    };
    const renderResults = (results) => {
        if (!results || results.length === 0) {
            UTILS.showError('Không tìm thấy kết quả nào phù hợp');
            return;
        }

        elements.tableBody.innerHTML = results.map((result, index) => `
      <tr class="result-row animate-fade-in" style="animation-delay: ${index * 0.1}s">
        <td class="text-center align-middle">${result.examRef?._id}</td>
        <td class="text-center align-middle">${result.userRef.fullname}</td>
        <td class="text-center align-middle">
          <span class="badge bg-success-subtle text-success">
            ${result.correctAnswers}
          </span>
        </td>
        <td class="text-center align-middle">
          <span class="badge bg-danger-subtle text-danger">
            ${result.incorrectAnswers}
          </span>
        </td>
        <td class="text-center align-middle">
          <span class="badge ${result.result ? 'bg-success' : 'bg-danger'} badge-result">
            ${result.result ? 'Đạt' : 'Chưa đạt'}
          </span>
        </td>
        <td class="text-center align-middle">
          ${UTILS.formatDate(result.createdAt)}
        </td>
      </tr>
    `).join('');
    };


    const handleSearch = async (event) => {
        event.preventDefault();

        const examId = elements.examCode.value.trim();
        const studentId = elements.studentId.value.trim();

        // Validation
        if (!studentId) {
            UTILS.showError('Vui lòng nhập đầy đủ  mã số sinh viên');
            return;
        }

        UTILS.showLoading();

        try {
            const response = await getHistoryExam(examId, studentId);
            if (response.status == 200) {
                const results = await response.json();
                renderResults(results.data);
            } else {
                UTILS.showError('Mã số sinh viên không hoặc mã đề thi không tồn tại !!');
            }

        } catch (error) {
            console.log(error)
            UTILS.showError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        }
    };

    // Event Listeners
    elements.form.addEventListener('submit', handleSearch);

    // Auto uppercase input
    [elements.examCode, elements.studentId].forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    });
});