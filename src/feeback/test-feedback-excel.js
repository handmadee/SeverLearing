const path = require('path');
const fs = require('fs');
const { convertExcelToFeedbackJson } = require('./models/feedBackStudent');

// Mẫu dữ liệu topic từ backend
const sampleTopicsData = [
    {
        _id: { toString: () => '68108db15d20386aa204c1b9' },
        name: 'Số',
        level: 1,
        order: 1,
        language: 'Python',
        description: 'Giới thiệu về kiểu dữ liệu số trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1ba' },
        name: 'Rẻ Nhánh',
        level: 1,
        order: 2,
        language: 'Python',
        description: 'Cấu trúc điều kiện và rẻ nhánh trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1bb' },
        name: 'Lặp',
        level: 1,
        order: 3,
        language: 'Python',
        description: 'Vòng lặp for và while trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1bc' },
        name: 'Danh Sách',
        level: 1,
        order: 4,
        language: 'Python',
        description: 'Kiểu dữ liệu danh sách (list) trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1bd' },
        name: 'Xâu',
        level: 1,
        order: 5,
        language: 'Python',
        description: 'Chuỗi ký tự trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1be' },
        name: 'Hàm',
        level: 1,
        order: 7,
        language: 'Python',
        description: 'Định nghĩa và sử dụng hàm trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1bf' },
        name: 'Dãy số',
        level: 1,
        order: 8,
        language: 'Python',
        description: 'Làm việc với dãy số trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c0' },
        name: 'Từ điển',
        level: 1,
        order: 9,
        language: 'Python',
        description: 'Kiểu dữ liệu từ điển (dictionary) trong Python',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c1' },
        name: 'Rẻ Nhánh',
        level: 2,
        order: 2,
        language: 'C++',
        description: 'Cấu trúc điều kiện và rẻ nhánh trong C++',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c2' },
        name: 'Lặp',
        level: 2,
        order: 3,
        language: 'C++',
        description: 'Vòng lặp for và while trong C++',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c3' },
        name: 'Mảng',
        level: 2,
        order: 4,
        language: 'C++',
        description: 'Kiểu dữ liệu mảng (array) trong C++',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c4' },
        name: 'Xâu',
        level: 2,
        order: 5,
        language: 'C++',
        description: 'Chuỗi ký tự trong C++',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c5' },
        name: 'Số học',
        level: 3,
        order: 1,
        language: 'Python',
        description: 'Các bài toán liên quan số nguyên, chia hết, ước chung, bòi chung,...',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c6' },
        name: 'Duyệt Mảng',
        level: 3,
        order: 2,
        language: 'Python',
        description: 'Kỹ thuật dò duyệt dữ liệu mảng nhiều chiều, theo điều kiện',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c7' },
        name: 'Lừa Bò',
        level: 3,
        order: 3,
        language: 'Python',
        description: 'Kiểm tra, loại bỏ phần tử theo điều kiện hoặc giá trị',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c8' },
        name: 'Xâu',
        level: 3,
        order: 4,
        language: 'Python',
        description: 'Các kỹ thuật xử lý xâu ở mức cao, như so sánh, tìm kiếm mẫu, thay thế,...',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1c9' },
        name: 'Mảng cộng dồn',
        level: 3,
        order: 5.1,
        language: 'Python',
        description: 'Tính tổng dồn và áp dụng trong xử lý dữ liệu nhanh',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1ca' },
        name: 'Đoạn Con',
        level: 3,
        order: 5.2,
        language: 'Python',
        description: 'Bài toán tìm đoạn con tối ưu theo điều kiện cụ thể',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1cb' },
        name: 'Kỹ thuật hai con trỏ',
        level: 3,
        order: 5.3,
        language: 'Python',
        description: 'Tối ưu với hai con trỏ nhằm rút ngắn thời gian xử lý',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1cc' },
        name: 'Tham Lam',
        level: 3,
        order: 6,
        language: 'Python',
        description: 'Chiến lược tham lam để đạt kết quả tốt nhất trong bước đi hiện tại',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1cd' },
        name: 'Tìm kiếm nhị phân',
        level: 3,
        order: 7,
        language: 'Python',
        description: 'Tìm kiếm nhanh trên dữ liệu đã sắp xếp',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1ce' },
        name: 'Quy hoạch động',
        level: 3,
        order: 8,
        language: 'Python',
        description: 'Gối vấn đề nhỏ hơn để tính toán hiệu quả',
    },
    {
        _id: { toString: () => '68108db15d20386aa204c1cf' },
        name: 'Đệ quy & Quay lui',
        level: 3,
        order: 9,
        language: 'Python',
        description: 'Kỹ thuật đệ quy và sinh các hoàn chỉnh có thể',
    }
];

// Đường dẫn đến file Excel
const excelFilePath = path.join(__dirname, '..', 'public', 'sheets', 'feedBackv4 .xlsx');

// Kiểm tra file có tồn tại
if (!fs.existsSync(excelFilePath)) {
    console.error(`File not found: ${excelFilePath}`);
    process.exit(1);
}

// Chuyển đổi Excel sang JSON
try {
    const feedbackData = convertExcelToFeedbackJson(excelFilePath, sampleTopicsData);
    console.log('Converted feedback data:');
    console.log(JSON.stringify(feedbackData, null, 2));
    console.log(`Successfully converted ${feedbackData.length} feedback records.`);
} catch (error) {
    console.error('Error during conversion:', error);
} 