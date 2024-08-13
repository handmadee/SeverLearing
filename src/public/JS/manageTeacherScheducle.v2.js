import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';

const shift = document.getElementById("shift");
const day = document.getElementById("day");
const saveInfor = document.getElementById("saveInfor");
const contentTable = document.getElementById("contentTable");
const teacherAccount = saveInfor.getAttribute('data-id');
const selectTeacher = document.querySelector(".teacher");
const nameClass = document.getElementById("nameClass");


// Lấy account đang vào
const fetchGetScheduleByTeacher = async (idTeacher, day, study) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}/class/teacher/${idTeacher}?day=${day}&study=${study}`);
        const data = await response.json();
        return data?.data?.data[0];
    } catch (error) {
        createToast('error', 'Thông báo lỗi khi tải lịch trình!');
    }
};

const fetchGetScheduleByTeacherExists = async (idTeacher, date, study) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}/attendanceTeacherV2/${idTeacher}?date=${date}&study=${study}`);
        const data = await response.json();
        return data?.data?.data;
    } catch (error) {
        createToast('error', 'Thông báo lỗi khi kiểm tra lịch trình đã tồn tại!');
    }
};


const fetchGetTeacherAll = async (idTeacher, date, study) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}/attendanceTeacherV2/${idTeacher}?date=${date}&study=${study}`);
        const data = await response.json();
        return data?.data?.data;
    } catch (error) {
        createToast('error', 'Thông báo lỗi khi kiểm tra lịch trình đã tồn tại!');
    }
};








// Thiết lập giá trị ngày và ca học hiện tại
const setInitialDateTime = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    day.value = currentDay === 0 ? 8 : currentDay + 1;

    const shifts = [
        { start: 8, end: 9.5, value: 1 },
        { start: 9.5, end: 11, value: 2 },
        { start: 14, end: 15.5, value: 3 },
        { start: 17, end: 18.5, value: 4 },
        { start: 18.5, end: 20, value: 5 },
        { start: 19.5, end: 21, value: 6 },
    ];

    const selectedShift = shifts.find(s => currentHour >= s.start && currentHour < s.end);
    shift.value = selectedShift ? selectedShift.value : 7;
};

// Hiển thị trạng thái loading
const renderLoading = () => {
    contentTable.innerHTML = `
        <tr>
            <td colspan="5" class="py-5">
                <div class="d-flex mx-2 col-12 justify-content-center">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </td>
        </tr>`;
};

// Hàm tạo các hàng cho trường hợp không có dữ liệu
const renderEmptyRow = () => `
    <tr>
        <td colspan="5" class="text-center">Không có học sinh học ca hiện tại</td>
    </tr>`;

// Hàm tạo các hàng cho trường hợp không có attendance data
const renderNormalRow = (item, index) => {
    const tr = document.createElement('tr');
    tr.className = "item-child";
    tr.style.height = '50px';
    tr.setAttribute('data-id', item?._id);
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item?.fullname}</td>
        <td><input type="radio" name="attendance${index}" value="present" checked /></td>
        <td><input type="radio" name="attendance${index}" value="absent" /></td>
        <td><input class="w-100 h-100 border-0 p-3" type="text" /></td>
    `;
    return tr;
};

// Hàm tạo các hàng cho trường hợp có attendance data
const renderAttendanceRow = (item, index) => {
    const tr = document.createElement('tr');
    tr.className = "item-child";
    tr.style.height = '50px';
    tr.setAttribute('data-id', item?._id);
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.studentAccount.fullname}</td>
        <td><input type="radio" name="attendance${index}" value="present" ${item.attendance ? 'checked' : ''} /></td>
        <td><input type="radio" name="attendance${index}" value="absent" ${!item.attendance ? 'checked' : ''} /></td>
        <td><input class="w-100 h-100 border-0 p-3" type="text" value='${item?.reason}' /></td>
    `;
    return tr;
};

// Hàm chính renderData
const renderData = (render, status = false) => {
    contentTable.innerHTML = '';

    if (Array.isArray(render) && render.length > 0) {
        render.forEach((item, index) => {
            if (status) {
                contentTable.appendChild(renderAttendanceRow(item, index));
            } else {
                contentTable.appendChild(renderNormalRow(item, index));
            }
        });
    } else {
        contentTable.innerHTML = renderEmptyRow();
    }
};

// Hàm lấy dữ liệu và render
const fetchData = async (study, day) => {
    renderLoading();
    try {
        const vietnamTimezoneOffset = 7 * 60; // Việt Nam có
        const date = new Date(new Date().getTime() + vietnamTimezoneOffset * 60 * 1000)
            .toISOString()
            .split('T')[0];
        console.log({
            vietnamTimezoneOffset
        })
        const attendanceFound = await fetchGetScheduleByTeacherExists(selectTeacher.value, date, study);
        // Điểm danh 
        if (attendanceFound && attendanceFound.length > 0) {
            saveInfor.textContent = 'Update';
            return renderData(attendanceFound, true);
        } else {
            const data = await fetchGetScheduleByTeacher(selectTeacher.value, day, study);
            nameClass.innerText = data?.nameClass || "....";
            renderData(data?.studentsAccount || [], false);
            saveInfor.textContent = 'Lưu điểm danh';
        }
    } catch (error) {
        console.error('Error:', error);
        createToast('error', 'Lỗi khi tải dữ liệu');
    }
};

// Hàm lưu dữ liệu
const saveData = async (data) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        result?.status === 200 ? createToast('success', 'Lưu thành công!') : createToast('error', 'Lưu thất bại!');
        location.reload();
    } catch (error) {
        createToast('error', error.message);
        console.error('Error:', error);
    }
};

// Hàm cập nhật dữ liệu
const updateData = async (data) => {
    const updatePromises = data.map(async (item) => {
        try {
            const response = await fetch(`${LOCALHOST_API_URL}updateSchedule/${item.studentAccount}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idTeacher: teacherAccount,
                    attendance: item.attendance,
                    reason: item.reason
                })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error updating student:', item.studentAccount, error);
            createToast('error', 'Lỗi khi cập nhật dữ liệu');
            return null;
        }
    });
    await Promise.all(updatePromises);
};

// Sự kiện DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function () {
    selectTeacher.value = teacherAccount;
    setInitialDateTime();
    await fetchData(shift.value, day.value);
    shift.addEventListener("change", async () => await fetchData(shift.value, day.value));
    day.addEventListener("change", async () => await fetchData(shift.value, day.value));
    selectTeacher.addEventListener("change", async () => await fetchData(shift.value, day.value));

    let isSaving = false;

    saveInfor.addEventListener("click", async function () {
        if (isSaving) return;
        isSaving = true;
        const data = Array.from(contentTable.children).map((tr) => {
            const vietnamTimezoneOffset = 7 * 60; // Việt Nam có múi giờ UTC+7
            const date = new Date(new Date().getTime() + vietnamTimezoneOffset * 60 * 1000)
                .toISOString()
                .split('T')[0];
            return {
                studentAccount: tr.getAttribute('data-id'),
                teacherAccount,
                fullname: tr.children[1].textContent,
                study: shift.value,
                attendance: tr.querySelector('input[type="radio"]:checked').value === 'present',
                reason: tr.querySelector('input[type="text"]').value,
                date,
                teacher_account_used: [teacherAccount]
            };
        });

        const userConfirmed = confirm("Xác nhận để lưu điểm danh!");
        if (userConfirmed) {
            saveInfor.textContent == 'Lưu điểm danh' ? await saveData(data) : await updateData(data);
        }

        isSaving = false;
    });
});
