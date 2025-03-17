const reader = require('xlsx');
const { parseSubject, generateCustomId } = require('./../untils/string.untils');
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
        const sheetName = sheets[0];
        const sheet = file.Sheets[sheetName];
        // Chuyển sheet thành JSON với cấu hình cụ thể
        const temp = reader.utils.sheet_to_json(sheet, {
            range: 2,
            header: [
                null,
                "idStudent",
                "nameStudents",
                "idTeacher",
                "A1",             // E: C++
                "A2",             // F: Python
                "A3",             // G: Scratch
                "skill",          // H: Kĩ năng lập trình
                "thinking",       // I: Tư duy môn học
                "content",        // j: Nhận xét
                null,             // k: cột trống
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
            console.log({
                a1, a2, a3
            })
            // Thêm các subjectScores
            feedback.subjectScores = [];
            if (a1) feedback.subjectScores.push(...a1);
            if (a2) feedback.subjectScores.push(...a2);
            if (a3) feedback.subjectScores.push(...a3);

            // Các thuộc tính khác
            feedback.skill = res.skill;
            feedback.thinking = res.thinking;
            feedback.content = res.content;
            console.log(feedback)
            data.push(feedback);
        });
        console.log(data)
        return data;
    } catch (error) {
        console.error("Đã xảy ra lỗi khi chuyển đổi file Excel:", error);
        return [];
    }
}

function convertExcelToStudentsJson(filePath) {
    console.log(filePath)
    let data = [];
    try {
        // Đọc file Excel
        const file = reader.readFile(filePath);
        const sheets = file.SheetNames;
        const sheetName = sheets[0];
        const sheet = file.Sheets[sheetName];
        const temp = reader.utils.sheet_to_json(sheet, {
            range: 2,
            header: [
                null,
                "TÊN HỌC SINH",
                "SĐT PH",
                "CA HỌC",
                "NGÀY HỌC/TUẦN",
            ],
            defval: null,
            blankrows: false,
            skipHidden: true
        });
        //
        const object_default = {
            fullname: "",
            phone: "",
            study: 0,
            days: []
        };
        // Xử lý từng hàng trong sheet
        temp.forEach((res) => {
            let feedback = { ...object_default };
            feedback.fullname = res["TÊN HỌC SINH"];
            feedback.phone = res["SĐT PH"];
            feedback.study = res["CA HỌC"];
            feedback.days = res["NGÀY HỌC/TUẦN"].split(',').map(day => parseInt(day.trim()));
            data.push(feedback);
        });
        console.log(data)
        return data;
    } catch (error) {
        console.error("Đã xảy ra lỗi khi chuyển đổi file Excel:", error);
        return [];
    }
}

function convertRawToExcel(data, worksheetColumnNames, outputFilePath, sheetName = 'Sheet1') {
    try {
        const worksheet = reader.utils.json_to_sheet(data, { header: worksheetColumnNames });
        const workbook = reader.utils.book_new();
        reader.utils.book_append_sheet(workbook, worksheet, sheetName);
        reader.writeFile(workbook, outputFilePath);
        console.log(`✅ Excel file successfully created: ${outputFilePath}`);
    } catch (error) {
        console.error("❌ Error exporting to Excel:", error.message);
    }
}

function exportFeedbackToExcel(feedbackData, outputPath = './feedback_export.xlsx') {

    try {
        const excelData = feedbackData.map((feedback, index) => {
            let cpp = { levels: new Map() };
            let python = { levels: new Map() };
            let scratch = { levels: new Map() };

            // Xử lý điểm môn học
            feedback.subjectScores.forEach(score => {
                const subject = score.languageIt;
                const level = score.level;
                const scoreValue = score.score;

                // Xác định đối tượng môn học cần cập nhật
                let targetSubject;
                if (subject.nameCode === 'C++') targetSubject = cpp;
                else if (subject.nameCode === 'Python') targetSubject = python;
                else if (subject.nameCode === 'Scratch') targetSubject = scratch;

                if (targetSubject) {
                    targetSubject.levels.set(level, scoreValue);
                }
            });

            // Chuyển đổi dữ liệu môn học sang định dạng Excel
            const formatSubjectString = (subject) => {
                if (subject.levels.size === 0) return null;
                return Array.from(subject.levels.entries())
                    .map(([level, score]) => `${level},${score}`)
                    .join(';');
            };
            console.log(feedback.studentsAccount?._id);
            return {
                'STT': index + 1,
                'ID Học viên': String(feedback.studentsAccount?._id || ''),
                'Tên học viên': feedback.studentsAccount?.fullname || '',
                'ID Giáo viên': String(feedback.teacherAccount?._id || ''),
                'C++': formatSubjectString(cpp) || '',
                'Python': formatSubjectString(python) || '',
                'Scratch': formatSubjectString(scratch) || '',
                'Kĩ năng lập trình': feedback.skill || '',
                'Tư duy môn học': feedback.thinking || '',
                'Nhận xét': feedback.contentFeedBack || '',
                ' ': ''
            };
        });

        // Tạo worksheet
        const ws = reader.utils.json_to_sheet(excelData, {
            header: [
                'STT',
                'ID Học viên',
                'Tên học viên',
                'ID Giáo viên',
                'C++',
                'Python',
                'Scratch',
                'Kĩ năng lập trình',
                'Tư duy môn học',
                'Nhận xét',
                ' '
            ],
            origin: 'A2'
        });

        // Thêm hàng tiêu đề
        reader.utils.sheet_add_aoa(ws, [
            ['BẢNG ĐÁNH GIÁ HỌC VIÊN'],
            []
        ], { origin: 'A1' });

        // Tạo workbook và thêm worksheet
        const wb = reader.utils.book_new();
        reader.utils.book_append_sheet(wb, ws, 'Feedback');

        // Đặt chiều rộng cột
        const colWidths = [
            { wch: 5 },  // STT
            { wch: 25 }, // ID Học viên
            { wch: 20 }, // Tên học viên
            { wch: 25 }, // ID Giáo viên
            { wch: 15 }, // C++
            { wch: 15 }, // Python
            { wch: 15 }, // Scratch
            { wch: 15 }, // Kĩ năng lập trình
            { wch: 15 }, // Tư duy môn học
            { wch: 30 }, // Nhận xét
            { wch: 5 }   // Cột trống
        ];
        ws['!cols'] = colWidths;

        // Ghi ra file
        reader.writeFile(wb, outputPath);
        return true;
    } catch (error) {
        console.error('Error exporting feedback to Excel:', error);
        return false;
    }
}
function exportStudentToExcel(studentData, outputPath = './students_export.xlsx') {
    try {
        // Chuyển đổi dữ liệu sang định dạng phù hợp
        const excelData = studentData.map((student, index) => ({
            'STT': index + 1,
            'TÊN HỌC SINH': student.fullname || '',
            'SĐT PH': student.phone || '',
            'CA HỌC': student.study || '',
            'NGÀY HỌC/TUẦN': Array.isArray(student.days) ? student.days.join(', ') : ''
        }));

        // Tạo worksheet từ dữ liệu JSON
        const ws = reader.utils.json_to_sheet(excelData, {
            header: ['STT', 'TÊN HỌC SINH', 'SĐT PH', 'CA HỌC', 'NGÀY HỌC/TUẦN'],
            origin: 'A2'
        });

        // Thêm hàng tiêu đề
        reader.utils.sheet_add_aoa(ws, [
            ['DANH SÁCH HỌC VIÊN TRUNG TÂM TSMART'],
            []
        ], { origin: 'A1' });

        // Thiết lập độ rộng cột
        ws['!cols'] = [
            { wch: 5 },   // STT
            { wch: 25 },  // Tên học viên
            { wch: 15 },  // SĐT PH
            { wch: 10 },  // Ca học
            { wch: 20 }   // Ngày học
        ];

        // Tạo workbook và thêm worksheet
        const wb = reader.utils.book_new();
        reader.utils.book_append_sheet(wb, ws, 'Students');

        // Ghi file Excel
        reader.writeFile(wb, outputPath);
        console.log(`✅ File Excel đã được tạo thành công: ${outputPath}`);

        return outputPath;
    } catch (error) {
        console.error('❌ Lỗi khi xuất file Excel:', error);
        return null;
    }
}

// convertExcelToStudentsJson('/Users/admin/Documents/TSMART/SeverLearing/import_students_default_v1.xlsx');
exportStudentToExcel([
    {
        _id: "6692016f40a1291a267b5bce",
        fullname: "Như Ý",
        phone: "0868552445",
        study: 1,
        days: [3, 5],
    },
]);



module.exports = {
    convertExcelToFeedbackJson,
    convertExcelToStudentsJson,
    convertRawToExcel,
    exportFeedbackToExcel,
    exportStudentToExcel
};