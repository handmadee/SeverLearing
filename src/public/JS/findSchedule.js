// 'use strict';

// import { LOCALHOST_API_URL } from './config.js';

// document.addEventListener('DOMContentLoaded', function () {
//     const shift = document.getElementById('shift');
//     const day = document.getElementById('day');
//     const date = document.getElementById('date');
//     const search = document.getElementById('search');
//     const content = document.getElementById('studentTableBody');

//     const dateNow12 = new Date().getDay() === 0 ? 8 : new Date().getDay() + 1;
//     day.value = dateNow12;
//     const today = new Date();
//     const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
//     date.value = localDate;

//     const renderLoad = async (value, days) => {
//         content.innerHTML = '';
//         const response = await fetch(`${LOCALHOST_API_URL}attendanceTeacher`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ study: value, date: days })
//         });
//         if (!response.ok) {
//             return createToast('error');
//         }
//         const listData = await response.json();
//         const render = listData?.data?.data;
//         console.log(render);
//         render && render.length > 0 ? render.forEach((item, index) => {
//             const status = item?.attendance ? 'Có mặt' : 'Vắng mặt';
//             const color = item?.attendance ? 'text-success' : 'text-danger';
//             const tr = document.createElement('tr');
//             tr.innerHTML = `
//                 <td>${index + 1}</td>
//                 <td>${item?.studentAccount?.fullname}</td>
//                 <td>${item?.studentAccount?.phone}</td>
//                 <td class="${color}">${status}</td>
//                 <td>${item?.reason || ''}</td>
//                 <td>
//                     <button 
//                       data-attendance="${item?.attendance}"
//                       data-id="${item?._id}"
//                       class="btn btn-success changeAttendance"
//                     >
//                     Thay đổi trạng thái
//                     </button>
//                 </td>
//             `;
//             content.appendChild(tr);
//         }) : content.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
//     }

//     content.addEventListener('click', async function (e) {
//         if (e.target && e.target.classList.contains('changeAttendance')) {
//             const value = e.target.getAttribute('data-id');
//             const status = e.target.getAttribute('data-attendance');
//             const attendance = status === 'true';
//             const response = await fetch(`${LOCALHOST_API_URL}changeAttendance/${value}`, {
//                 method: 'PATCH',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     attendance: !attendance
//                 })
//             });
//             if (!response.ok) {
//                 return createToast('error');
//             }
//             const result = await response.json();
//             console.log(result);
//             if (result?.status === 200) {
//                 alert('Thay đổi trạng thái thành công');
//                 location.reload();
//             } else {
//                 createToast('error');
//             }
//         }
//     });
//     // Render load on first time
//     renderLoad(shift.value, `${new Date(date.value).getFullYear()}-${new Date(date.value).getMonth() + 1}-${new Date(date.value).getDate()}`);

//     search.addEventListener('click', async function () {
//         content.innerHTML = '';
//         const dateNow = `${new Date(date.value).getFullYear()}-${new Date(date.value).getMonth() + 1}-${new Date(date.value).getDate()}`;
//         const study = shift.value;
//         renderLoad(study, dateNow);
//     });
// });





'use strict';

import { LOCALHOST_API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    const shift = document.getElementById('shift');
    const day = document.getElementById('day');
    const date = document.getElementById('date');
    const search = document.getElementById('search');
    const content = document.getElementById('studentTableBody');

    // Vietnam timezone offset adjustment
    const vietnamTimezoneOffset = 7 * 60; // Vietnam timezone offset in minutes
    const localDate = new Date(new Date().getTime() + vietnamTimezoneOffset * 60 * 1000).toLocaleDateString('en-CA');
    date.value = localDate;

    const dateNow12 = new Date().getDay() === 0 ? 8 : new Date().getDay() + 1;
    day.value = dateNow12;

    const renderLoad = async (value, days) => {
        content.innerHTML = '';
        try {
            const response = await fetch(`${LOCALHOST_API_URL}attendanceTeacher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ study: value, date: days })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attendance data');
            }

            const { data: { data: render } = {} } = await response.json();

            if (render && render.length > 0) {
                render.forEach((item, index) => {
                    const status = item?.attendance ? 'Có mặt' : 'Vắng mặt';
                    const color = item?.attendance ? 'text-success' : 'text-danger';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${item?.studentAccount?.fullname}</td>
                        <td>${item?.studentAccount?.phone}</td>
                        <td class="${color}">${status}</td>
                        <td>${item?.reason || ''}</td>
                        <td>
                            <button 
                              data-attendance="${item?.attendance}"
                              data-id="${item?._id}"
                              class="btn btn-success changeAttendance"
                            >
                            Thay đổi trạng thái
                            </button>
                        </td>
                    `;
                    content.appendChild(tr);
                });
            } else {
                content.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
            }
        } catch (error) {
            console.error(error);
            createToast('error');
        }
    };

    content.addEventListener('click', async function (e) {
        if (e.target && e.target.classList.contains('changeAttendance')) {
            const value = e.target.getAttribute('data-id');
            const status = e.target.getAttribute('data-attendance');
            const attendance = status === 'true';
            try {
                const response = await fetch(`${LOCALHOST_API_URL}changeAttendance/${value}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ attendance: !attendance })
                });

                if (!response.ok) {
                    throw new Error('Failed to change attendance status');
                }

                const result = await response.json();
                if (result?.status === 200) {
                    alert('Thay đổi trạng thái thành công');
                    e.target.setAttribute('data-attendance', !attendance);
                    const statusCell = e.target.closest('tr').querySelector('td:nth-child(4)');
                    statusCell.textContent = !attendance ? 'Có mặt' : 'Vắng mặt';
                    statusCell.className = !attendance ? 'text-success' : 'text-danger';
                } else {
                    createToast('error');
                }
            } catch (error) {
                console.error(error);
                createToast('error');
            }
        }
    });

    // Render load on first time with current date and shift
    renderLoad(shift.value, localDate);

    search.addEventListener('click', function () {
        const selectedDate = new Date(new Date(date.value).getTime() + vietnamTimezoneOffset * 60 * 1000)
            .toLocaleDateString('en-CA');
        renderLoad(shift.value, selectedDate);
    });
});
