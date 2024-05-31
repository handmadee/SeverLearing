// use strict

'use strict';

import { LOCALHOST_API_URL } from './config.js'




document.addEventListener('DOMContentLoaded', function () {
    const shift = document.getElementById('shift');
    const day = document.getElementById('day');
    const date = document.getElementById('date');
    const search = document.getElementById('search');
    const content = document.getElementById('studentTableBody');



    const dateNow12 = new Date().getDay() == 0 ? 8 : new Date().getDay() + 1;
    day.value = dateNow12;
    date.value = new Date().toISOString().split('T')[0];
    const renderLoad = async (value, days) => {
        content.innerHTML = '';
        const response = await fetch(`${LOCALHOST_API_URL}attendanceTeacher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ study: value, date: days })
        });
        if (!response.ok) {
            return createToast('error');
        }
        const listData = await response.json();
        const render = listData?.data?.data;
        render && render.length > 0 ? render.forEach((item, index) => {
            const status = item?.attendance ? 'Có mặt' : 'Vắng mặt';
            const color = item?.attendance ? 'text-success' : 'text-danger';
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item?.studentAccount?.fullname}</td>
            <td>${item?.studentAccount?.phone}</td>
            <td class="${color}">${status}</td>
            <td
            ><button 
              data-attendace = ${item?.attendance}
              data-id = ${item?._id}
            class = "btn btn-success"
            id = "changeAttendance"
            >
            Thay đổi trạng thái
            </button></td>

                `;
            content.appendChild(tr);
        }) : content.innerHTML = '<tr><td colspan="4" class="text-center">Không có dữ liệu</td></tr>';
        if (render && render.length > 0) {
            const changeAttendance = document.getElementById('changeAttendance');
            // changeAttendance     
            changeAttendance.addEventListener('click', async function (e) {
                const value = e.target.getAttribute('data-id');
                const status = e.target.getAttribute('data-attendace');
                const attendace = status == 'true' ? true : false;
                const response = await fetch(`${LOCALHOST_API_URL}changeAttendance/${value}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ attendnce: !attendace })
                });
                if (!response.ok) {
                    return createToast('error');
                }
                const result = await response.json();
                if (result?.status === 200) {
                    alert('Thay đổi trạng thái thành công');
                    location.reload();
                } else {
                    createToast('error');
                }

            });
        }


    }
    // render load on first time
    renderLoad(shift.value, `${new Date(date.value).getFullYear()}-${new Date(date.value).getMonth() + 1}-${new Date(date.value).getDate()}`);
    search.addEventListener('click', async function (e) {
        content.innerHTML = '';
        const dateNow = `${new Date(date.value).getFullYear()}-${new Date(date.value).getMonth() + 1}-${new Date(date.value).getDate()}`;
        const study = shift.value;
        renderLoad(study, dateNow);
    });




});
