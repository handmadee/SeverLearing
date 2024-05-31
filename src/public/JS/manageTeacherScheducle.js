import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';

const shift = document.getElementById("shift");
const day = document.getElementById("day");
const saveInfor = document.getElementById("saveInfor");
const contentTable = document.getElementById("contentTable");

document.addEventListener("DOMContentLoaded", async function () {
    // Handle shift change
    const days = new Date().getDay() == 0 ? 8 : new Date().getDay() + 1;
    day.value = days;
    // Tự động select đúng h học 
    const shiftNow = new Date().getHours() + (new Date().getMinutes() / 60);
    if (shiftNow >= 8 && shiftNow <= 9.30) {
        shift.value = 1;
    } else if (shiftNow >= 9.30 && shiftNow <= 11) {
        shift.value = 2;
    } else if (shiftNow >= 17 && shiftNow <= 18.5) {
        shift.value = 3;
    } else if (shiftNow >= 18.5 && shiftNow <= 20) {
        shift.value = 4;
    } else {
        shift.value = 5;
    }


    const renderLoad = async (value, days) => {
        contentTable.innerHTML = '';
        const response = await fetch(`${LOCALHOST_API_URL}getScheducle?study=${value}&days=${days}`);
        if (!response.ok) {
            return createToast('error');
        }
        const listData = await response.json();
        const render = listData?.data?.data;
        console.log(render);

        if (render && render.length > 0) {
            render.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', item?._id);
                tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item?.fullname}</td>
            <td>
                <input type="radio" name="attendance${index}" value="present"  />
            </td>
            <td>
                <input type="radio" name="attendance${index}" value="absent" checked />
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

    }
    await renderLoad(shift.value, days);
    shift.addEventListener("change", async function (e) {
        const days = day.value;
        const value = e.target.value;
        await renderLoad(value, days);
    });

    day.addEventListener("change", async function (e) {
        // Handle day change
        const days = e.target.value;
        const value = shift.value;
        await renderLoad(value, days);
    });
    // Save schedule for teacher
    saveInfor.addEventListener("click", async function () {
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
        console.log(data)
        // Call API to save data
        const response = await fetch(`${LOCALHOST_API_URL}attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            return createToast('error');
        }
        const result = await response.json();
        if (result?.status === 200) {
            createToast('success');
        } else {
            createToast('error');
        }
    });
});


