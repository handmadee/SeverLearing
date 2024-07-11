import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';

const shift = document.getElementById("shift");
const day = document.getElementById("day");
const saveInfor = document.getElementById("saveInfor");
const contentTable = document.getElementById("contentTable");
const teacherAccount = saveInfor.getAttribute('data-id');


document.addEventListener("DOMContentLoaded", async function () {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours() + (now.getMinutes() / 60);
    // Set the day value
    day.value = currentDay === 0 ? 8 : currentDay + 1;
    // Automatically select the correct shift based on the current time
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
    } else if (currentHour >= 19.5 && currentHour < 21) {
        shift.value = 6;
    } else {
        shift.value = 7;
    }

    let isStatus = true;

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

    const renderData = (render) => {
        contentTable.innerHTML = '';
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
                        <td><input type="radio" name="attendance${index}" value="present" checked /></td>
                        <td><input type="radio" name="attendance${index}" value="absent" /></td>
                        <td><input class="w-100 h-100 border-0 p-3" type="text" /></td>
                    `;
                    contentTable.appendChild(tr);
                });
            } else {
                contentTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">Không có học sinh học ca hiện tại</td>
                    </tr>`;
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
                    <td><input type="radio" name="attendance${index}" value="present" ${st ? 'checked' : ''} /></td>
                    <td><input type="radio" name="attendance${index}" value="absent" ${!st ? 'checked' : ''} /></td>
                    <td><input class="w-100 h-100 border-0 p-3" type="text" value='${item?.reason}' /></td>
                `;
                contentTable.appendChild(tr);
            });
        }
    };

    const fetchData = async (value, days) => {
        renderLoading();
        try {
            const response = await fetch(`${LOCALHOST_API_URL}getScheducle?study=${value}&days=${days}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const listData = await response.json();
            const render = listData?.data?.data;
            isStatus = render.status;
            saveInfor.textContent = isStatus ? 'Lưu điểm danh' : 'Update';
            renderData(render);
        } catch (error) {
            console.error('Error:', error);
            createToast('error', error.message);
        }
    };

    await fetchData(shift.value, day.value);

    shift.addEventListener("change", async function (e) {
        await fetchData(e.target.value, day.value);
    });

    day.addEventListener("change", async function (e) {
        await fetchData(shift.value, e.target.value);
    });

    let isSaving = false;

    const saveData = async (data) => {
        try {
            const response = await fetch(`${LOCALHOST_API_URL}attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            if (result?.status === 200) {
                createToast('success');
                location.reload();
            } else {
                createToast('error');
            }
        } catch (error) {
            createToast('error', error.message);
            console.error('Error:', error);
        }
    };

    const updateData = async (data) => {
        const updatePromises = data.map(async (item) => {
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
                return await response.json();
            } catch (error) {
                console.error('Error updating student:', item.studentAccount, error);
                createToast('error', error.message);
                return null;
            }
        });
        const results = await Promise.all(updatePromises);
        results.forEach(result => {
            if (result?.status !== 200) {
                createToast('error');
            }
        });
        createToast('success');
    };

    saveInfor.addEventListener("click", async function () {
        if (isSaving) return;
        isSaving = true;
        const data = Array.from(contentTable.children).map((tr) => {
            const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            const id = tr.getAttribute('data-id');
            const fullname = tr.children[1].textContent;
            const attendance = tr.querySelector('input[type="radio"]:checked').value;
            const note = tr.querySelector('input[type="text"]').value;
            return {
                studentAccount: id,
                teacherAccount,
                fullname,
                study: shift.value,
                attendance: attendance === 'present',
                reason: note,
                date
            };
        });

        if (isStatus) {
            const userConfirmed = confirm("Xác nhận để lưu điểm danh");
            if (userConfirmed) {
                await saveData(data);
            }
        } else {
            await updateData(data);
        }
        isSaving = false;
    });
});
