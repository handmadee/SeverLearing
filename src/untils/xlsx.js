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

/**
 * Normalizes a string by removing diacritics, special characters, and transforming to lowercase
 * @param {string} name - The string to normalize
 * @returns {string} The normalized string
 */
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

/**
 * Converts Excel feedback data to structured JSON format compatible with the database model
 * @param {string} filePath - Path to the Excel file
 * @param {Object|Array} topicsData - Topic data which may be nested in a response object
 * @returns {Array} Structured feedback data ready for database insertion
 */
function convertExcelToFeedbackJson(filePath, topicsData) {
    if (!filePath) {
        console.error("Missing required parameter: filePath");
        return [];
    }

    // Extract topics array from response if needed
    const topics = extractTopicsArray(topicsData);

    if (!topics || !topics.length) {
        console.error("No valid topics data provided");
        return [];
    }

    try {
        // Initialize result array
        const feedbackData = [];

        // Read Excel file
        console.log(`Reading Excel file: ${filePath}`);
        const workbook = reader.readFile(filePath);
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
            console.error("Excel file contains no sheets");
            return [];
        }

        console.log(`Using sheet: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];

        // Show the sheet reference structure for debugging
        console.log(`Sheet reference: ${sheet['!ref']}`);

        // Determine the header row position
        // Sometimes Excel files have titles in the first row and headers in the second row
        let headerRowIndex = 0; // Default to first row

        // Check the first few rows to find the row with expected headers
        const expectedHeaders = ['STT', 'ID Học viên', 'Tên học viên', 'ID Giáo viên'];

        for (let i = 0; i < 3; i++) { // Check first 3 rows
            const rowData = {};
            for (let col = 0; col < 10; col++) { // Check first 10 columns
                const cellRef = reader.utils.encode_cell({ r: i, c: col });
                const cell = sheet[cellRef];
                if (cell && cell.v) {
                    rowData[col] = String(cell.v).trim();
                }
            }

            // Check if this row contains expected headers
            const headerMatch = expectedHeaders.some(header =>
                Object.values(rowData).some(value =>
                    value === header || value.includes(header)
                )
            );

            if (headerMatch) {
                headerRowIndex = i;
                console.log(`Found header row at index ${i}`);
                break;
            }
        }

        // Read data with the determined header row
        const jsonData = reader.utils.sheet_to_json(sheet, {
            defval: null,      // Default value for empty cells
            blankrows: false,  // Skip blank rows
            raw: true,         // Keep the raw data values
            range: headerRowIndex // Start from the header row we found
        });

        if (!jsonData || jsonData.length === 0) {
            console.error("No data found in Excel file or headers not detected");
            console.log("Sheet structure:", Object.keys(sheet).filter(k => !k.startsWith('!')));
            return [];
        }

        console.log(`Successfully read ${jsonData.length} rows of data`);
        console.log("Sample data row:", jsonData[0]);

        // Extract headers from the first row's object keys
        const headers = Object.keys(jsonData[0]);
        console.log("Headers extracted:", headers);

        if (headers.length === 0) {
            console.error("No headers found in Excel file");
            return [];
        }

        // Create topic mapping for efficient lookups
        const topicMappings = createTopicMappings(topics);

        // Process each row in the JSON data
        jsonData.forEach((rowData, idx) => {
            if (!rowData || Object.keys(rowData).length === 0) {
                console.log(`Skipping empty row ${idx}`);
                return; // Skip empty rows
            }

            const feedback = createFeedbackObject(rowData, headers, topicMappings);

            if (feedback && validateFeedback(feedback)) {
                feedbackData.push(feedback);
            } else {
                console.log(`Row ${idx} failed validation:`, rowData);
            }
        });

        console.log(`Successfully processed ${feedbackData.length} valid feedback entries`);
        return feedbackData;
    } catch (error) {
        console.error("Error converting Excel file:", error);
        return [];
    }
}


function extractTopicsArray(topicsData) {
    if (!topicsData) return [];
    if (Array.isArray(topicsData)) return topicsData;
    if (topicsData.data) {
        if (topicsData.data.data && Array.isArray(topicsData.data.data)) {
            return topicsData.data.data;
        }
        if (Array.isArray(topicsData.data)) {
            return topicsData.data;
        }
    }

    console.error("Unknown topics data format:", typeof topicsData);
    return [];
}


function createTopicMappings(topicsData) {
    const directMap = {};
    const partialMatches = {};
    const keyToTopicMap = {};
    const nameToTopicMap = {};
    if (!Array.isArray(topicsData) || !topicsData.length) {
        return { directMap, partialMatches, keyToTopicMap, nameToTopicMap };
    }
    topicsData.forEach(topic => {
        if (!topic || !topic._id) return;
        if (topic.key) {
            keyToTopicMap[topic.key] = topic;
            const normalizedKey = normalizeName(topic.key);
            if (normalizedKey) {
                directMap[normalizedKey] = {
                    id: topic._id.toString(),
                    language: topic.language,
                    level: topic.level,
                    key: topic.key
                };
            }
        }

        // Store mapping from name to topic object
        if (topic.name) {
            nameToTopicMap[topic.name] = topic;

            // Process topic names for direct matching
            const normalizedName = normalizeName(topic.name);
            if (normalizedName) {
                directMap[normalizedName] = {
                    id: topic._id.toString(),
                    language: topic.language,
                    level: topic.level,
                    key: topic.key || null
                };
            }

            // Process compound topic names for partial matching
            if (topic.name.includes('&') || topic.name.includes('+') || topic.name.includes(',') || topic.name.includes('-')) {
                const parts = topic.name.split(/[&+,\-]/);

                parts.forEach(part => {
                    const normalizedPart = normalizeName(part);
                    if (normalizedPart && normalizedPart.length > 3) { // Avoid too short names
                        partialMatches[normalizedPart] = normalizedName;
                    }
                });
            }
        }
    });

    return { directMap, partialMatches, keyToTopicMap, nameToTopicMap };
}

/**
 * Creates a feedback object from row data
 * @param {Object} rowData - Excel row data
 * @param {Array} headers - Array of column headers
 * @param {Object} topicMappings - Topic mapping structures
 * @returns {Object} Structured feedback object
 */
function createFeedbackObject(rowData, headers, topicMappings) {
    const { directMap, partialMatches, keyToTopicMap, nameToTopicMap } = topicMappings;

    const feedback = {
        teacherAccount: rowData['ID Giáo viên'],
        studentsAccount: rowData['ID Học viên'],
        subjectScores: extractSubjectScores(rowData),
        skill: rowData['Kĩ năng lập trình'] || '',
        thinking: rowData['Tư duy môn học'] || '',
        contentFeedBack: rowData['Nhận xét'] || '',
        learningStatus: []
    };

    // Define non-topic columns to skip
    const nonTopicColumns = [
        'STT', 'ID Học viên', 'Tên học viên', 'ID Giáo viên', 'C++', 'Python',
        'Scratch', 'Kĩ năng lập trình', 'Tư duy môn học', 'Nhận xét'
    ];

    headers.forEach(header => {
        if (!header || nonTopicColumns.includes(header)) return;

        let topicId = null;
        let matchedTopic = null;

        // Try to match by direct key or name first (exact match)
        if (keyToTopicMap[header]) {
            matchedTopic = keyToTopicMap[header];
            topicId = matchedTopic._id.toString();
        }
        else if (nameToTopicMap[header]) {
            matchedTopic = nameToTopicMap[header];
            topicId = matchedTopic._id.toString();
        }
        // No exact match, try fuzzy matching via normalized versions
        else {
            const topicStatus = processTopicColumn(header, rowData[header], directMap, partialMatches);
            if (topicStatus) {
                feedback.learningStatus.push(topicStatus);
            }
            return;
        }

        // If we found a direct match, process the status
        if (topicId) {
            const status = parseInt(rowData[header]) || 0;
            if (status >= 0 && status <= 2) {
                feedback.learningStatus.push({
                    topic: new Types.ObjectId(topicId),
                    status: status
                });
            }
        }
    });

    return feedback;
}

/**
 * Extracts subject scores from row data
 * @param {Object} rowData - Excel row data
 * @returns {Array} Array of subject score objects
 */
function extractSubjectScores(rowData) {
    const scores = [];

    ['C++', 'Python', 'Scratch'].forEach(lang => {
        if (!rowData[lang]) return;

        const parts = String(rowData[lang]).split(',').map(x => x.trim());

        if (parts.length === 2) {
            const languageKey = lang === 'C++' ? 'CPP' : lang.toUpperCase();
            scores.push({
                languageIt: LanguageIDs[languageKey],
                level: parts[0],
                score: parseFloat(parts[1])
            });
        }
    });

    return scores;
}

/**
 * Processes a topic column and returns a topic status object
 * @param {string} topicName - Name of the topic
 * @param {any} statusValue - Status value from Excel
 * @param {Object} directMap - Direct topic name mapping
 * @param {Object} partialMatches - Partial topic name matches
 * @returns {Object|null} Topic status object or null if not found
 */
function processTopicColumn(topicName, statusValue, directMap, partialMatches) {
    if (!topicName) return null;

    // Direct match by normalized name
    const normalizedTopic = normalizeName(topicName);
    let matchedTopicId = null;

    // Try direct match first
    if (normalizedTopic && directMap[normalizedTopic]) {
        matchedTopicId = directMap[normalizedTopic].id;
    }
    // Then try partial match
    else if (normalizedTopic && partialMatches[normalizedTopic]) {
        const fullNormalizedName = partialMatches[normalizedTopic];
        if (directMap[fullNormalizedName]) {
            matchedTopicId = directMap[fullNormalizedName].id;
        }
    }
    // If no match found, return null
    else {
        return null;
    }

    // Convert status value to number in range 0-2
    const status = parseInt(statusValue) || 0;
    if (status < 0 || status > 2) return null;

    return {
        topic: new Types.ObjectId(matchedTopicId),
        status: status
    };
}

/**
 * Validates a feedback object
 * @param {Object} feedback - Feedback object
 * @returns {boolean} True if valid
 */
function validateFeedback(feedback) {
    return (
        feedback.teacherAccount &&
        feedback.studentsAccount &&
        Array.isArray(feedback.subjectScores) &&
        Array.isArray(feedback.learningStatus)
    );
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
            console.log("🚀 ~ excelData ~ feedback:", feedback);
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
        // 
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



const sampleTopics = [
    {
        _id: "6811dc86c3a4ef900b161639",
        key: "Số",
        name: "Số",
        level: 1,
        order: 1,
        language: "Python",
        description: "Giới thiệu về kiểu dữ liệu số trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.240Z",
        updatedAt: "2025-04-30T08:17:10.240Z"
    },
    {
        _id: "6811dc86c3a4ef900b16163a",
        key: "Rẻ Nhánh",
        name: "Rẻ Nhánh",
        level: 1,
        order: 2,
        language: "Python",
        description: "Cấu trúc điều kiện và rẻ nhánh trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.241Z",
        updatedAt: "2025-04-30T08:17:10.241Z"
    },
    {
        _id: "6811dc86c3a4ef900b16163b",
        key: "Lặp",
        name: "Lặp",
        level: 1,
        order: 3,
        language: "Python",
        description: "Vòng lặp for và while trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.241Z",
        updatedAt: "2025-04-30T08:17:10.241Z"
    },
    {
        _id: "6811dc86c3a4ef900b16163c",
        key: "Danh Sách",
        name: "Danh Sách",
        level: 1,
        order: 4,
        language: "Python",
        description: "Kiểu dữ liệu danh sách (list) trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.241Z",
        updatedAt: "2025-04-30T08:17:10.241Z"
    },
    {
        _id: "6811dc86c3a4ef900b16163d",
        key: "Xâu",
        name: "Xâu",
        level: 1,
        order: 5,
        language: "Python",
        description: "Chuỗi ký tự trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.241Z",
        updatedAt: "2025-04-30T08:17:10.241Z"
    },
    {
        _id: "6811dc86c3a4ef900b16163e",
        key: "Hàm",
        name: "Hàm",
        level: 1,
        order: 6,
        language: "Python",
        description: "Định nghĩa và sử dụng hàm trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.241Z",
        updatedAt: "2025-04-30T08:17:10.241Z"
    },
    {
        _id: "6811dc86c3a4ef900b16163f",
        key: "Dãy số",
        name: "Dãy số",
        level: 1,
        order: 7,
        language: "Python",
        description: "Làm việc với dãy số trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161640",
        key: "Từ điển",
        name: "Từ điển",
        level: 1,
        order: 8,
        language: "Python",
        description: "Kiểu dữ liệu từ điển (dictionary) trong Python",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161641",
        key: "Số học-lv2",
        name: "Số học",
        level: 2,
        order: 1,
        language: "C++",
        description: "Cấu trúc điều kiện và rẻ nhánh trong C++",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161642",
        key: "Rẻ Nhánh-lv2",
        name: "Rẻ Nhánh",
        level: 2,
        order: 2,
        language: "C++",
        description: "Cấu trúc điều kiện và rẻ nhánh trong C++",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161643",
        key: "Hàm-lv2",
        name: "Hàm",
        level: 2,
        order: 3,
        language: "C++",
        description: "Cấu trúc điều kiện và rẻ nhánh trong C++",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161644",
        key: "Lặp-lv2",
        name: "Lặp",
        level: 2,
        order: 4,
        language: "C++",
        description: "Vòng lặp for và while trong C++",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161645",
        key: "Duyệt mảng",
        name: "Duyệt mảng",
        level: 2,
        order: 5,
        language: "C++",
        description: "Kiểu dữ liệu mảng (array) trong C++",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161646",
        key: "Xâu-lv2",
        name: "Xâu",
        level: 2,
        order: 6,
        language: "C++",
        description: "Chuỗi ký tự trong C++",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.242Z",
        updatedAt: "2025-04-30T08:17:10.242Z"
    },
    {
        _id: "6811dc86c3a4ef900b161647",
        key: "Số học-lv3",
        name: "Số học",
        level: 3,
        order: 1,
        language: "Python",
        description: "Các bài toán liên quan số nguyên, chia hết, ước chung, bòi chung,...",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b161648",
        key: "Duyệt Mảng-lv3",
        name: "Duyệt Mảng",
        level: 3,
        order: 2,
        language: "Python",
        description: "Kỹ thuật dò duyệt dữ liệu mảng nhiều chiều, theo điều kiện",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b161649",
        key: "Lùa bò",
        name: "Lùa bò",
        level: 3,
        order: 3,
        language: "Python",
        description: "Kiểm tra, loại bỏ phần tử theo điều kiện hoặc giá trị",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b16164a",
        key: "Xâu-lv3",
        name: "Xâu",
        level: 3,
        order: 4,
        language: "Python",
        description: "Các kỹ thuật xử lý xâu ở mức cao, như so sánh, tìm kiếm mẫu, thay thế,...",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b16164b",
        key: "Mảng cộng dồn",
        name: "Mảng cộng dồn",
        level: 3,
        order: 5.1,
        language: "Python",
        description: "Tính tổng dồn và áp dụng trong xử lý dữ liệu nhanh",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b16164c",
        key: "Đoạn Con",
        name: "Đoạn Con",
        level: 3,
        order: 5.2,
        language: "Python",
        description: "Bài toán tìm đoạn con tối ưu theo điều kiện cụ thể",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b16164d",
        key: "Kỹ thuật hai con trỏ",
        name: "Kỹ thuật hai con trỏ",
        level: 3,
        order: 5.3,
        language: "Python",
        description: "Tối ưu với hai con trỏ nhằm rút ngắn thời gian xử lý",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b16164e",
        key: "Tham Lam",
        name: "Tham Lam",
        level: 3,
        order: 6,
        language: "Python",
        description: "Chiến lược tham lam để đạt kết quả tốt nhất trong bước đi hiện tại",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b16164f",
        key: "Tìm kiếm nhị phân",
        name: "Tìm kiếm nhị phân",
        level: 3,
        order: 7,
        language: "Python",
        description: "Tìm kiếm nhanh trên dữ liệu đã sắp xếp",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b161650",
        key: "Quy hoạch động",
        name: "Quy hoạch động",
        level: 3,
        order: 8,
        language: "Python",
        description: "Gối vấn đề nhỏ hơn để tính toán hiệu quả",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    },
    {
        _id: "6811dc86c3a4ef900b161651",
        key: "Đệ quy & Quay lui",
        name: "Đệ quy & Quay lui",
        level: 3,
        order: 9,
        language: "Python",
        description: "Kỹ thuật đệ quy và sinh các hoàn chỉnh có thể",
        isActive: true,
        __v: 0,
        createdAt: "2025-04-30T08:17:10.243Z",
        updatedAt: "2025-04-30T08:17:10.243Z"
    }
]
module.exports = {
    convertExcelToFeedbackJson,
    convertExcelToStudentsJson,
    convertRawToExcel,
    exportFeedbackToExcel,
    exportStudentToExcel
};