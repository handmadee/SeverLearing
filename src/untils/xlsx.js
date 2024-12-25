const reader = require('xlsx');
const { parseSubject } = require('./../untils/string.untils');
const { SubjectUID } = require('../enums/feeback.enum');

/**
 * Chuyển đổi file Excel thành mảng JSON chứa thông tin feedback.
 * @param {string} filePath - Đường dẫn tới file Excel.
 * @returns {Array} - Mảng các đối tượng feedback.
 */
function convertExcelToFeedbackJson(filePath) {
    let data = [];

    try {
        // Đọc file Excel
        const file = reader.readFile(filePath);
        const sheets = file.SheetNames;

        // Lặp qua từng sheet
        for (let i = 0; i < sheets.length; i++) {
            const sheetName = sheets[i];
            const sheet = file.Sheets[sheetName];

            // Chuyển sheet thành JSON với cấu hình cụ thể
            const temp = reader.utils.sheet_to_json(sheet, {
                range: 2, // Bắt đầu từ hàng 3 (0-indexed)
                header: [
                    "idStudent", // A: Mã số học sinh
                    null,             // B: cột trống
                    "idTeacher", // C: Mã số giáo viên
                    null,             // D: cột trống
                    "A1",             // E: C++
                    null,             // F: cột trống
                    "A2",             // G: Python
                    null,             // H: cột trống
                    "A3",             // I: Scratch
                    null,             // J: cột trống
                    "skill",          // K: Kĩ năng lập trình
                    null,             // L: cột trống
                    "thinking",       // M: Tư duy môn học
                    null,             // N: cột trống
                    "content" // O: Nhận xét
                ],
                defval: null,       // Giá trị mặc định nếu ô trống
                blankrows: false,   // Bỏ qua hàng trống
                skipHidden: true    // Bỏ qua hàng ẩn
            });

            // Xử lý từng hàng trong sheet
            temp.forEach((res) => {
                let feedback = {};
                feedback.idStudent = res.idStudent;
                feedback.idTeacher = res.idTeacher;

                // Parse các môn học
                let a1 = parseSubject(res.A1, SubjectUID.C);       // C++
                let a2 = parseSubject(res.A2, SubjectUID.PYTHON);  // Python
                let a3 = parseSubject(res.A3, SubjectUID.SCRATCH); // Scratch

                // Thêm các subjectScores
                feedback.subjectScores = [];
                if (a1) feedback.subjectScores.push(a1);
                if (a2) feedback.subjectScores.push(a2);
                if (a3) feedback.subjectScores.push(a3);

                // Các thuộc tính khác
                feedback.skill = res.skill;
                feedback.thinking = res.thinking;
                feedback.content = res.content;

                data.push(feedback);
            });
        }

        console.log('====================================');
        console.log("HELLO - WORD SHEET TO JSON");
        console.log('====================================');
        console.log(data);

        return data;
    } catch (error) {
        console.error("Đã xảy ra lỗi khi chuyển đổi file Excel:", error);
        return [];
    }
}



module.exports = convertExcelToFeedbackJson;
