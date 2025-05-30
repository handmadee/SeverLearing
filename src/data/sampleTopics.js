// Level 1 Topics
const pythonTopics = [
    {
        name: 'Số',
        key: 'Số',
        level: 1, order: 1, language: 'Python', description: 'Giới thiệu về kiểu dữ liệu số trong Python'
    },
    {
        name: 'Rẻ Nhánh',
        key: 'Rẻ Nhánh',
        level: 1, order: 2, language: 'Python', description: 'Cấu trúc điều kiện và rẻ nhánh trong Python'
    },
    {
        name: 'Lặp',
        key: 'Lặp',
        level: 1, order: 3, language: 'Python', description: 'Vòng lặp for và while trong Python'
    },
    {
        name: 'Danh Sách',
        key: 'Danh Sách',
        level: 1, order: 4, language: 'Python', description: 'Kiểu dữ liệu danh sách (list) trong Python'
    },
    {
        name: 'Xâu',
        key: 'Xâu', level: 1, order: 5, language: 'Python', description: 'Chuỗi ký tự trong Python'
    },
    {
        name: 'Hàm',
        key: 'Hàm',
        level: 1, order: 6, language: 'Python', description: 'Định nghĩa và sử dụng hàm trong Python'
    },
    {
        name: 'Dãy số',
        key: 'Dãy số',
        level: 1, order: 7, language: 'Python', description: 'Làm việc với dãy số trong Python'
    },
    {
        name: 'Từ điển',
        key: 'Từ điển',
        level: 1, order: 8, language: 'Python', description: 'Kiểu dữ liệu từ điển (dictionary) trong Python'
    },
];

const cppTopics = [
    {
        name: 'Số học',
        key: 'Số học-lv2',
        level: 2, order: 1, language: 'C++', description: 'Cấu trúc điều kiện và rẻ nhánh trong C++'
    },
    {
        name: 'Rẻ Nhánh',
        key: 'Rẻ Nhánh-lv2',
        level: 2, order: 2, language: 'C++', description: 'Cấu trúc điều kiện và rẻ nhánh trong C++'
    },
    {
        name: 'Hàm',
        key: 'Hàm-lv2',
        level: 2, order: 3, language: 'C++', description: 'Cấu trúc điều kiện và rẻ nhánh trong C++'
    },
    {
        name: 'Lặp',
        key: 'Lặp-lv2',
        level: 2, order: 4, language: 'C++', description: 'Vòng lặp for và while trong C++'
    },
    {
        name: 'Duyệt mảng',
        key: 'Duyệt mảng',
        level: 2, order: 5, language: 'C++', description: 'Kiểu dữ liệu mảng (array) trong C++'
    },
    {
        name: 'Xâu',
        key: 'Xâu-lv2',
        level: 2, order: 6, language: 'C++', description: 'Chuỗi ký tự trong C++'
    },
];

const pythonTopicsLv3 = [
    {
        name: 'Số học',
        key: 'Số học-lv3',
        level: 3, order: 1, language: 'Python', description: 'Các bài toán liên quan số nguyên, chia hết, ước chung, bòi chung,...'
    },
    {
        name: 'Duyệt Mảng',
        key: 'Duyệt Mảng-lv3',
        level: 3, order: 2, language: 'Python', description: 'Kỹ thuật dò duyệt dữ liệu mảng nhiều chiều, theo điều kiện'
    },
    {
        name: 'Lùa bò',
        key: 'Lùa bò',
        level: 3, order: 3, language: 'Python', description: 'Kiểm tra, loại bỏ phần tử theo điều kiện hoặc giá trị'
    },
    {
        name: 'Xâu',
        key: 'Xâu-lv3', level: 3, order: 4, language: 'Python', description: 'Các kỹ thuật xử lý xâu ở mức cao, như so sánh, tìm kiếm mẫu, thay thế,...'
    },
    {
        name: 'Mảng cộng dồn',
        key: 'Mảng cộng dồn',
        level: 3, order: 5.1, language: 'Python', description: 'Tính tổng dồn và áp dụng trong xử lý dữ liệu nhanh'
    },
    {
        name: 'Đoạn Con',
        key: 'Đoạn Con',
        level: 3, order: 5.2, language: 'Python', description: 'Bài toán tìm đoạn con tối ưu theo điều kiện cụ thể'
    },
    {
        name: 'Kỹ thuật hai con trỏ',
        key: 'Kỹ thuật hai con trỏ',
        level: 3, order: 5.3, language: 'Python', description: 'Tối ưu với hai con trỏ nhằm rút ngắn thời gian xử lý'
    },
    {
        name: 'Tham Lam',
        key: 'Tham Lam',
        level: 3, order: 6, language: 'Python', description: 'Chiến lược tham lam để đạt kết quả tốt nhất trong bước đi hiện tại'
    },
    {
        name: 'Tìm kiếm nhị phân',
        key: 'Tìm kiếm nhị phân',
        level: 3, order: 7, language: 'Python', description: 'Tìm kiếm nhanh trên dữ liệu đã sắp xếp'
    },
    {
        name: 'Quy hoạch động',
        key: 'Quy hoạch động',
        level: 3, order: 8, language: 'Python', description: 'Gối vấn đề nhỏ hơn để tính toán hiệu quả'
    },
    {
        name: 'Đệ quy & Quay lui',
        key: 'Đệ quy & Quay lui',
        level: 3, order: 9, language: 'Python', description: 'Kỹ thuật đệ quy và sinh các hoàn chỉnh có thể'
    }
];

// Combine all topics
const allTopics = [
    ...pythonTopics,
    ...cppTopics,
    ...pythonTopicsLv3
];

module.exports = {
    allTopics
};
