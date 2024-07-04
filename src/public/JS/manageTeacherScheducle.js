import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';

const shift = document.getElementById("shift");
const day = document.getElementById("day");
const saveInfor = document.getElementById("saveInfor");
const contentTable = document.getElementById("contentTable");

document.addEventListener("DOMContentLoaded", async function () {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours() + (now.getMinutes() / 60);

    // Xử lý thay đổi ca học
    day.value = currentDay === 0 ? 8 : currentDay + 1;

    // Tự động chọn ca học đúng dựa trên thời gian hiện tại
    if (currentHour >= 8 && currentHour < 9.30) {
        shift.value = 1;
    } else if (currentHour >= 9.30 && currentHour < 11) {
        shift.value = 2;
    } else if (currentHour >= 14 && currentHour < 15.5) {
        shift.value = 3;
    } else if (currentHour >= 17 && currentHour < 18.5) {
        shift.value = 4;
    } else if (currentHour >= 18.5 && currentHour < 20) {
        shift.value = 5;
    } else {
        shift.value = 6;
    }

    let isStatus = true;

    const renderLoad = async (value, days) => {
        contentTable.innerHTML = '';
        try {
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

            saveInfor.textContent = isStatus ? 'Lưu điểm danh' : 'Update';

            if (render.status) {
                if (render.data.length > 0) {
                    render.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        tr.className = "item-child";
                        tr.style.height = '50px';
                        tr.setAttribute('data-id', item?._id);
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item?.fullname}</td>
                            <td>
                                <input type="radio" name="attendance${index}" value="present" checked />
                            </td>
                            <td>
                                <input type="radio" name="attendance${index}" value="absent" />
                            </td>
                            <td>
                                <input class="w-100 h-100 border-0 p-3" type="text" />
                            </td>
                        `;
                        contentTable.appendChild(tr);
                    });
                } else {
                    contentTable.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">Không có học sinh học ca hiện tại</td>
                        </tr>
                    `;
                }
            } else {
                render.data.forEach((item, index) => {
                    const st = item.attendance;
                    const tr = document.createElement('tr');
                    tr.className = "item-child";
                    tr.style.height = '50px';
                    tr.setAttribute('data-id', item?._id);
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${item.studentAccount.fullname}</td>
                        <td>
                            <input type="radio" name="attendance${index}" value="present" ${st ? 'checked' : ''} />
                        </td>
                        <td>
                            <input type="radio" name="attendance${index}" value="absent" ${!st ? 'checked' : ''} />
                        </td>
                        <td>
                            <input class="w-100 h-100 border-0 p-3" type="text" value='${item?.reason}' />
                        </td>
                    `;
                    contentTable.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error');
        }
    };

    await renderLoad(shift.value, day.value);

    shift.addEventListener("change", async function (e) {
        await renderLoad(e.target.value, day.value);
    });

    day.addEventListener("change", async function (e) {
        await renderLoad(shift.value, e.target.value);
    });

    let isSaving = false;

    saveInfor.addEventListener("click", async function () {
        if (isSaving) return;
        isSaving = true;

        const data = Array.from(contentTable.children).map((tr, index) => {
            const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            const id = tr.getAttribute('data-id');
            const fullname = tr.children[1].textContent;
            const attendance = tr.querySelector('input[type="radio"]:checked').value;
            const note = tr.querySelector('input[type="text"]').value;
            return {
                studentAccount: id,
                fullname,
                study: shift.value,
                attendance: attendance === 'present',
                reason: note,
                date
            };
        });

        if (isStatus) {
            const userConfirmed = confirm("Xác nhận để lưu điểm danh  ");
            if (userConfirmed) {
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
            } else {
                isSaving = false;
            }
        } else {
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

            try {
                const updatePromises = data.map(item => sendUpdateRequest(item));
                const results = await Promise.all(updatePromises);
                results.forEach(result => {
                    if (result?.status === 200) {
                        // Cập nhật thành công
                    } else {
                        createToast('error');
                    }
                });
                createToast('success');
                console.log('Tất cả cập nhật đã hoàn tất');
            } catch (error) {
                console.error('Lỗi khi cập nhật học sinh:', error);
                createToast('error');
            } finally {
                isSaving = false;
            }
        }
    });
});
