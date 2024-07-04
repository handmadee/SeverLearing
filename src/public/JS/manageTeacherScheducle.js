import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';

const shift = document.getElementById("shift");
const day = document.getElementById("day");
const saveInfor = document.getElementById("saveInfor");
const contentTable = document.getElementById("contentTable");

document.addEventListener("DOMContentLoaded", async function () {
    // Xử lý thay đổi ca học
    const days = new Date().getDay() == 0 ? 8 : new Date().getDay() + 1;
    day.value = days;

    // Tự động chọn ca học đúng dựa trên thời gian hiện tại
    const shiftNow = new Date().getHours() + (new Date().getMinutes() / 60);
    if (shiftNow >= 8 && shiftNow <= 9.30) {
        shift.value = 1;
    } else if (shiftNow >= 9.30 && shiftNow <= 11) {
        shift.value = 2;
    } else if (shiftNow >= 14 && shiftNow <= 15.5) {
        shift.value = 3;
    } else if (shiftNow >= 17 && shiftNow <= 18.5) {
        shift.value = 4;
    } else if (shiftNow >= 18.5 && shiftNow <= 20) {
        shift.value = 5;
    } else {
        shift.value = 6;
    }

    let isStatus = true;

    const renderLoad = async (value, days) => {
        contentTable.innerHTML = '';
        const response = await fetch(`${LOCALHOST_API_URL}getScheducle?study=${value}&days=${days}`);
        if (!response.ok) {
            return createToast('error');
        }
        const listData = await response.json();
        const render = listData?.data?.data;
        console.log({
            message: `render :: []`,
            render
        });
        isStatus = render.status;

        if (!isStatus) {
            saveInfor.textContent = 'Update'
        } else {
            saveInfor.textContent = 'Lưu điểm danh'
        }
        // 

        // Status 
        if (render.status) {
            render.data.length > 0 ? render.data.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = "item-child"
                tr.style.height = '50px'
                tr.setAttribute('data-id', item?._id);
                tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item?.fullname}</td>
            <td>
                <input type="radio" name="attendance${index}" value="present" checked />
            </td>
            <td>
                <input type="radio" name="attendance${index}" value="absent"  />
            </td>
            <td>
                <input class="w-100 h-100 border-0 p-3" type="text" />
            </td>
        `;
                contentTable.appendChild(tr);
            }) : contentTable.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">Không có học sinh học ca hiện tại</td>
        </tr>
    `;
        } else if (!render.status) {
            render.data.forEach((item, index) => {
                // attendance là trạng thái điểm danh 
                const st = item.attendance;
                const tr = document.createElement('tr');
                tr.className = "item-child"
                tr.style.height = '50px'
                tr.setAttribute('data-id', item?._id);
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.studentAccount.fullname}</td>
                <td>
                    <input type="radio" name="attendance${index}" value="present" ${st ? 'checked' : ''}  />
                </td>
                <td>
                    <input type="radio" name="attendance${index}" value="absent"  ${!st ? 'checked' : ''}  />
                </td>
                <td>
                    <input class="w-100 h-100 border-0 p-3" type="text" value='${item?.reason}' />
                </td>
            `;
                contentTable.appendChild(tr);
            });


            // ver 2 :: 
            // render && render.data.length > 0 ? render.data.forEach((item, index) => {
            //     const status = item?.attendance ? 'Có mặt' : 'Vắng mặt';
            //     const color = item?.attendance ? 'text-success' : 'text-danger';
            //     const tr = document.createElement('tr');
            //     tr.innerHTML = `
            //     <td>${index + 1}</td>
            //     <td>${item?.studentAccount?.fullname}</td>
            //     <td>${item?.studentAccount?.phone}</td>
            //     <td class="${color}">${status}</td>
            //     <td>${item?.reason || ''}</td>
            //     <td>
            //         <button 
            //           data-attendance="${item?.attendance}"
            //           data-id="${item?._id}"
            //           class="btn btn-success changeAttendance"
            //         >
            //         Thay đổi trạng thái
            //         </button>
            //     </td>
            // `;
            //     contentTable.appendChild(tr);
            // }) : contentTable.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
        } else {
            contentTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Không có học sinh học ca hiện tại</td>
                </tr>
            `;
        }
    }

    await renderLoad(shift.value, days);

    shift.addEventListener("change", async function (e) {
        const days = day.value;
        const value = e.target.value;
        await renderLoad(value, days);
    });

    day.addEventListener("change", async function (e) {
        // Xử lý thay đổi ngày
        const days = e.target.value;
        const value = shift.value;
        await renderLoad(value, days);
    });





    let isSaving = false;
    saveInfor.addEventListener("click", async function () {
        if (isStatus) {
            const userConfirmed = confirm("Xác nhận để lưu điểm danh  ");
            if (userConfirmed) {
                if (isSaving) return;
                isSaving = true;
                const data = Array.from(contentTable.children).map((tr, index) => {
                    const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
                    const id = tr.getAttribute('data-id');
                    const fullname = tr.children[1].textContent;
                    const attendance = tr.querySelector('input[type="radio"]:checked').value;
                    const note = tr.querySelector('input[type="text"]').value;
                    return {
                        studentAccount: id,
                        fullname,
                        study: shift.value,
                        attendance: attendance == 'present' ? true : false,
                        reason: note,
                        date
                    }
                });

                console.log({
                    message: `update :: []`,
                    data
                })
                try {
                    const response = await fetch(`${LOCALHOST_API_URL}attendance`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    if (!response.ok) {
                        createToast('error');
                    } else {
                        const result = await response.json();
                        if (result?.status === 200) {
                            createToast('success');
                            location.reload();
                        } else {
                            createToast('error');
                        }
                    }
                } catch (error) {
                    createToast('error');
                    console.error('Error:', error);
                } finally {
                    isSaving = false;
                }
            }
        } else {
            const data = Array.from(contentTable.children).map((tr, index) => {
                const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
                const id = tr.getAttribute('data-id');
                const attendance = tr.querySelector('input[type="radio"]:checked').value;
                const note = tr.querySelector('input[type="text"]').value;
                return {
                    studentAccount: id,
                    study: shift.value,
                    attendance: attendance == 'present' ? true : false,
                    reason: note,
                    date
                }
                // Data 


            });
            const sendUpdateRequest = async (item) => {
                try {
                    const response = await fetch(`${LOCALHOST_API_URL}changeAttendance/${item.studentAccount}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            attendance: item.attendance,
                            reason: item.reason
                        })
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const result = await response.json();
                    return result;
                } catch (error) {
                    console.error('Error updating student:', item.studentAccount, error);
                    createToast('error');
                    return null;
                }
            };
            const updateAllStudents = async () => {
                const updatePromises = data.map(item => sendUpdateRequest(item));
                const results = await Promise.all(updatePromises);
                results.forEach(result => {
                    if (result?.status === 200) {

                    } else {
                        createToast('error');
                    }
                });
            };

            updateAllStudents().then(() => {
                createToast('success');
                location.reload();
                console.log('All updates completed');
            }).catch((error) => {
                console.error('Error updating students:', error);
            });



        }
    });
});
