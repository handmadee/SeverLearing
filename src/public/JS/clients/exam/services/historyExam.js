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
    console.log(results)
    if (!results || results.length === 0) {
      UTILS.showError('Không tìm thấy kết quả nào phù hợp');
      return;
    }

    elements.tableBody.innerHTML = results.map((result, index) => {
      const section1Correct = result.sections.section1.correctAnswers.length;
      const section1Total = result.sections.section1.totalQuestions;

      // Phần 2 - Common
      const section2CommonTotal = result.sections.section2.common.totalQuestions * 4; // Mỗi câu có 4 ý
      const section2CommonCorrect = calculateCommonCorrect(result.sections.section2.common);

      // Phần 2 - Specialized
      const section2SpecializedTotal = result.sections.section2.specialized.totalQuestions * 4; // Mỗi câu có 4 ý
      const section2SpecializedCorrect = calculateSpecializedCorrect(result.sections.section2.specialized);

      // Tổng số câu đúng và tổng số câu
      const totalCorrect = section1Correct + section2CommonCorrect + section2SpecializedCorrect;
      const totalQuestions = section1Total + section2CommonTotal + section2SpecializedTotal;
      const totalIncorrect = totalQuestions - totalCorrect;


      return `
      <tr class="result-row animate-fade-in" style="animation-delay: ${index * 0.1}s">
        <td class="text-center align-middle">${result.examRef?._id}</td>
        <td class="text-center align-middle">${result.userRef.fullname}</td>
        <td class="text-center align-middle">
          <span class="badge bg-success-subtle text-success">
            ${totalCorrect}
          </span>
        </td>
        <td class="text-center align-middle">
          <span class="badge bg-danger-subtle text-danger">
            ${totalIncorrect}
          </span>
        </td>
        <td class="text-center align-middle">
          <span class="badge ${result.result ? 'bg-success' : 'bg-danger'} badge-result">
            ${result.totalScore}
          </span>
        </td>
        <td class="text-center align-middle">
          ${UTILS.formatDate(result.createdAt)}
        </td>
      </tr>
    `

    }
    ).join('');
  };

  const calculateCommonCorrect = (commonSection) => {
    let correctAnswers = 0;
    correctAnswers += commonSection.correctAnswers.length * 4;
    commonSection.incorrectAnswers.forEach(question => {
      correctAnswers += (4 - question.wrongAnswers.length);
    });

    return correctAnswers;
  };

  const calculateSpecializedCorrect = (specializedSection) => {
    let correctAnswers = 0;
    correctAnswers += specializedSection.correctAnswers.length * 4;
    specializedSection.incorrectAnswers.forEach(question => {
      correctAnswers += (4 - question.wrongAnswers.length);
    });

    return correctAnswers;
  };


  const handleSearch = async (event) => {
    event.preventDefault();

    const examId = elements.examCode.value.trim();
    const studentId = elements.studentId.value.trim();

    // Validation
    if (!studentId) {
      UTILS.showError('Vui lòng nhập đầy đủ  mã số học sinh');
      return;
    }

    UTILS.showLoading();

    try {
      const response = await getHistoryExam(examId, studentId);
      if (response.status == 200) {
        const results = await response.json();
        renderResults(results.data);
      } else {
        UTILS.showError('Mã số học sinh không hoặc mã đề thi không tồn tại !!');
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