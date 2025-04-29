const reader = require('xlsx');
const { generateCustomId, parseLearningStatus } = require('./string.untils');
const { SubjectUID } = require('../enums/feeback.enum');
const { Types } = require('mongoose');

/**
 * Parse subject score from string format "level,score"
 * @param {string} value - The score string in format "level,score"
 * @param {string} subjectUID - The subject ID
 * @returns {Array|null} - Array of score objects or null if invalid
 */
function parseSubject(value, subjectUID) {
    if (!value) return null;

    try {
        const parts = value.split(',').map(s => s.trim());
        if (parts.length < 2) return null;

        const level = Number(parts[0]);
        const score = Number(parts[1]);

        if (isNaN(level) || isNaN(score)) return null;

        return [{
            languageIt: subjectUID,
            level: level.toString(),
            score: score
        }];
    } catch (error) {
        console.error("Error parsing subject:", error);
        return null;
    }
}

function normalizeName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/&/g, '')
        .replace(/[^\w]/g, '');
}


const LanguageIDs = {
    PYTHON: '6767ff3d4ba9e6b3d58a8aec',
    CPP: '6767ff474ba9e6b3d58a8af0',
    SCRATCH: '6767ff304ba9e6b3d58a8ae8'
};

function convertExcelToFeedbackJson(filePath, topicsData, languageIDs) {
    let data = [];
    try {
        const file = reader.readFile(filePath);

        // Log file structure for debugging
        console.log("Processing Excel file:", filePath);

        const sheets = file.SheetNames;
        const sheet = file.Sheets[sheets[0]];

        // Log all cell references for debugging
        console.log("Sheet cells:", Object.keys(sheet).filter(k => k !== '!ref' && k !== '!margins'));

        const range = reader.utils.decode_range(sheet['!ref']);
        console.log("Sheet range:", range);

        // We need to manually parse the Excel to handle specific structure
        // First, identify header rows
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; C++) {
            // Get header from row 1 (index 1)
            const cell = sheet[reader.utils.encode_cell({ r: 1, c: C })];
            headers.push(cell ? (cell.v || '').trim() : null);
        }

        console.log("Headers:", headers);

        // Create normalized topic map for matching
        const topicMap = {};
        const partialMatches = {}; // For matching partial topic names

        if (topicsData && topicsData.length) {
            topicsData.forEach(topic => {
                const normalizedName = normalizeName(topic.name);
                if (topicMap[normalizedName]) {
                    console.log(`Duplicate topic name after normalization: ${topic.name} (normalized: ${normalizedName})`);
                }
                topicMap[normalizedName] = {
                    id: topic._id.toString(),
                    language: topic.language,
                    level: topic.level
                };

                // Also store parts of compound topic names for partial matching
                if (topic.name.includes('&') || topic.name.includes('+') || topic.name.includes(',')) {
                    const parts = topic.name.split(/[&+,]/);
                    parts.forEach(part => {
                        const normalizedPart = normalizeName(part);
                        if (normalizedPart && normalizedPart.length > 3) { // Avoid too short names
                            partialMatches[normalizedPart] = normalizedName;
                        }
                    });
                }
            });
        }

        console.log("Normalized topic names:", Object.keys(topicMap));
        console.log("Partial matches:", partialMatches);

        // Process each row by looping through all rows in the range
        for (let R = 2; R <= range.e.r; R++) {  // Start from row 3 (index 2)
            const row = {};
            let hasData = false;

            // Read all columns for this row
            for (let C = 0; C < headers.length; C++) {
                const cellRef = reader.utils.encode_cell({ r: R, c: C });
                const cell = sheet[cellRef];

                if (cell && cell.v !== undefined && cell.v !== null) {
                    row[headers[C]] = cell.v;
                    hasData = true;
                }
            }

            if (!hasData) continue; // Skip empty rows

            console.log(`Processing row ${R + 1}:`, JSON.stringify(row));

            const feedback = {
                teacherAccount: row['ID Giáo viên'],
                studentsAccount: row['ID Học viên'],
                subjectScores: [],
                skill: row['Kĩ năng lập trình'] || '',
                thinking: row['Tư duy môn học'] || '',
                contentFeedBack: row['Nhận xét'] || '',
                learningStatus: []
            };

            // Xử lý điểm
            ['C++', 'Python', 'Scratch'].forEach(lang => {
                if (row[lang]) {
                    const parts = row[lang].toString().split(',').map(x => x.trim());
                    if (parts.length === 2) {
                        const languageKey = lang === 'C++' ? 'CPP' : lang.toUpperCase();
                        feedback.subjectScores.push({
                            languageIt: LanguageIDs[languageKey],
                            level: parts[0],
                            score: parseFloat(parts[1])
                        });
                    }
                }
            });

            // Xử lý từng topic
            for (let i = 0; i < headers.length; i++) {
                const topicName = headers[i];
                if (!topicName) continue;

                // Skip non-topic columns
                if (['STT', 'ID Học viên', 'Tên học viên', 'ID Giáo viên', 'C++', 'Python',
                    'Scratch', 'Kĩ năng lập trình', 'Tư duy môn học', 'Nhận xét'].includes(topicName)) {
                    continue;
                }

                const normalizedTopic = normalizeName(topicName);
                let matchedTopicId = null;

                // First try direct match
                if (normalizedTopic && topicMap[normalizedTopic]) {
                    matchedTopicId = topicMap[normalizedTopic].id;
                }
                // Then try partial match
                else if (normalizedTopic && partialMatches[normalizedTopic]) {
                    const fullNormalizedName = partialMatches[normalizedTopic];
                    matchedTopicId = topicMap[fullNormalizedName].id;
                    console.log(`Partial match found: ${topicName} -> ${fullNormalizedName}`);
                }
                else {
                    console.log(`Topic not found in map: ${topicName} (normalized: ${normalizedTopic})`);
                    continue;
                }

                const status = parseInt(row[topicName]) || 0;
                if (status >= 0 && status <= 2) {
                    feedback.learningStatus.push({
                        topic: new Types.ObjectId(matchedTopicId),
                        status: status
                    });
                }
            }

            data.push(feedback);
        }

        return data;

    } catch (error) {
        console.error("Error converting Excel file:", error);
        return [];
    }
}

function exportFeedbackToExcel(feedbackData, topicsData, outputPath = './feedback_export.xlsx') {
    console.log("🚀 ~ exportFeedbackToExcel ~ feedbackData:", feedbackData)
    try {
        const headers = [
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
            ...topicsData.map(t => t.name) // Thêm các topic vào cuối
        ];

        const excelData = feedbackData.map((feedback, index) => {
            const row = {};

            row['STT'] = index + 1;
            row['ID Học viên'] = String(feedback.studentsAccount?._id || '');
            row['Tên học viên'] = feedback.studentsAccount?.fullname || '';
            row['ID Giáo viên'] = String(feedback.teacherAccount?._id || '');

            // Môn học
            const subjectMap = {};
            feedback.subjectScores.forEach(score => {
                const nameCode = score.languageIt?.nameCode;
                if (!nameCode) return;
                const key = nameCode === 'CPP' ? 'C++' : nameCode;
                if (!subjectMap[key]) subjectMap[key] = [];
                subjectMap[key].push(`${score.level},${score.score}`);
            });

            row['C++'] = subjectMap['C++']?.join(';') || '';
            row['Python'] = subjectMap['Python']?.join(';') || '';
            row['Scratch'] = subjectMap['Scratch']?.join(';') || '';

            row['Kĩ năng lập trình'] = feedback.skill || '';
            row['Tư duy môn học'] = feedback.thinking || '';
            row['Nhận xét'] = feedback.contentFeedBack || '';

            // Topic status
            topicsData.forEach(topic => {
                const found = feedback.learningStatus.find(t => t.topic?.toString() === topic._id.toString());
                row[topic.name] = found?.status ?? '';
            });

            return row;
        });

        const ws = reader.utils.json_to_sheet(excelData, {
            header: headers,
            origin: 'A2'
        });

        // Thêm tiêu đề chính
        reader.utils.sheet_add_aoa(ws, [['BẢNG ĐÁNH GIÁ HỌC VIÊN'], []], { origin: 'A1' });

        // Đặt chiều rộng cột (optional)
        ws['!cols'] = headers.map(h => ({ wch: h.length + 5 }));

        const wb = reader.utils.book_new();
        reader.utils.book_append_sheet(wb, ws, 'Feedback');
        reader.writeFile(wb, outputPath);

        return true;
    } catch (error) {
        console.error('Error exporting feedback to Excel:', error);
        return false;
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

        return outputPath;
    } catch (error) {
        console.error('❌ Lỗi khi xuất file Excel:', error);
        return null;
    }
}

module.exports = {
    convertExcelToFeedbackJson,
    convertExcelToStudentsJson,
    convertRawToExcel,
    exportFeedbackToExcel,
    exportStudentToExcel
};