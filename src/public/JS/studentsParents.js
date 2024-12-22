import { LOCALHOST_API_URL } from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = LOCALHOST_API_URL;

    const getLanguages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}language`);
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error("Error fetching languages:", error);
            return [];
        }
    };

    const getFeedBackByIdForMonth = async (id, month) => {
        try {
            const response = await fetch(`${API_BASE_URL}feedback/students/${id}?month=${month}`);
            const data = await response.json();
            return data?.data?.data;
        } catch (error) {
            console.error("Error fetching feedback:", error);
            return [];
        }
    };

    const getAllFeedBack = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbackStudents/${id}`);
            const data = await response.json();
            return data?.data?.data;
        } catch (error) {
            console.error("Error fetching all feedback:", error);
            return [];
        }
    };

    const loading = (contentClass) => {
        contentClass.innerHTML = `
            <div style="position: absolute;" class="d-flex mx-2 col-12 justify-content-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    };

    const renderTable = (tableWrapper, data = [], languages = []) => {
        if (!data.length || !languages.length) {
            tableWrapper.innerHTML = `<p style="text-align: center;">Không có dữ liệu.</p>`;
            return;
        }

        const tableHTML = data.map((student) => {
            return `
            <table class="progressTable">
                <thead>
                    <tr>
                        <th>Teams</th>
                        ${languages.map(lang => `<th>${lang.nameCode}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${[1, 2, 3].map(level => {
                return `<tr>
                            <td>LEVEL ${level}</td>
                            ${languages.map(lang => {
                    if (!student?.subjectScores) {
                        return `<td>  </td>`
                    }

                    const matched = student.subjectScores.find(
                        score => score.languageIt.nameCode === lang.nameCode && score.level == level
                    );
                    return `<td>${matched ? `${matched.score} BÀI TẬP` : " "}</td>`;
                }).join('')}
                        </tr>`;
            }).join('')}
                </tbody>
            </table>
            <div class="feedback-section">
                <div class="evaluation-card">
                    <div class="skills-assessment">
                        <h4 class="section-title">KỸ NĂNG HỌC TẬP</h4>
                        <div class="skills-grid">
                            <div class="skill-item">
                                <span>Kỹ năng lập trình</span>
                                <div class="rating">
                                    <label class="${student?.thinking && student?.skill?.includes('good') ? 'active' : ''}">Tốt</label>
                                    <label class="${student?.thinking && student?.skill?.includes('rather') ? 'active' : ''}">Khá</label>
                                    <label class="${student?.thinking && student?.skill?.includes('medium') ? 'active' : ''}">Trung bình</label>
                                </div>
                            </div>
                            <div class="skill-item">
                                <span>Tư duy môn học</span>
                                <div class="rating">
                                    <label class="${student?.thinking && student?.thinking.includes('good') ? 'active' : ''}">Tốt</label>
                                    <label class="${student?.thinking && student?.thinking.includes('rather') ? 'active' : ''}">Khá</label>
                                    <label class="${student?.thinking && student?.thinking.includes('medium') ? 'active' : ''}">Trung bình</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="detailed-feedback">
                        <h4 class="section-title">NHẬN XÉT CHI TIẾT</h4>
                        
                        <div>
                                <div class="feedback-item">
                            <i class="fa-solid fa-check"></i>
                            <p> ${student.contentFeedBack || 'Chưa có đánh giá'}</p>
                        </div>

                

            
                     <div class="signature">
                        <div class="date">
                            <strong>Ngày đánh giá:</strong>
                            <span>${new Date(student.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="teacher">TSMART</div>
                    </div>
                        </div>                        
                    </div>
            
                    

                </div>
            </div>`;
        }).join('');

        tableWrapper.innerHTML = tableHTML;
    };

    const idStudents = document.getElementById('IdStudent');
    const time = document.getElementById('time');
    const tableWrapper = document.getElementById('data');
    const id = idStudents.dataset.id;
    const currentMonth = new Date().getMonth() + 1;
    time.value = currentMonth;
    loading(tableWrapper);

    const languages = await getLanguages();
    const data = await getFeedBackByIdForMonth(id, currentMonth);
    renderTable(tableWrapper, data, languages);
    console.log(data)

    time.addEventListener('change', async (event) => {
        loading(tableWrapper);
        let data = [];
        if (event.target.value === 'all') {
            data = await getAllFeedBack(id);
        } else {
            data = await getFeedBackByIdForMonth(id, event.target.value);
        }
        renderTable(tableWrapper, data, languages);
    });
});
