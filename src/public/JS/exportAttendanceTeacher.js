'use strict';
import { LOCALHOST_API_URL } from './config.js'


document.addEventListener('DOMContentLoaded', function () {
    const shift = document.getElementById("shift");
    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");
    const exportBtn = document.getElementById("export");
    const content = document.getElementById("attendanceTable");
    const count = document.getElementById("countStudy")
    // Popup
    const editCoursePopup = document.getElementById('editModal');
    const cancelPopup = document.getElementById('cancelPopup');
    const cancelPopup2 = document.getElementById('cancelPopup2');
    const account = document.getElementById('account');
    const date12 = document.getElementById('date');
    const study1 = document.getElementById('study');
    const contentStudents = document.getElementById('studentTableBody');



    const renderLoad = async (date, date1, idTeacher) => {
        const techerNow = shift.getAttribute("data-name");
        content.innerHTML = `
        <tr>
        <td colspan="5" class="py-5">
            <div class="d-flex mx-2 col-12 justify-content-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </td>
        </tr>`

        const response = await fetch(`${LOCALHOST_API_URL}getAttendanceAloneByTeacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idTeacher, date, date1 }),
        });
        content.innerHTML = ''
        if (!response.ok) {
            return createToast("error");
        }
        const listData = await response.json();
        const render = listData?.data?.data;
        count.textContent = render.length;
        if (render && render.length > 0) {
            render.forEach((item, index) => {
                const dateN = new Date(item?.date);
                const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).format(dateN);

                console.log({
                    dateN,
                    formattedDate
                })





                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item?.teacherAccount}</td>
                <td
                class="text-success"
                >${item?.study}</td>
                   <td
                class="text-success"
                >${formattedDate}</td>
                <td 
                  class="text-danger"
                >${item?.totalCount}</td>
                <td>  <button
                    data-teacher="${item?.teacherAccount}"
                 data-date="${item?.date}"
                 data-dateNow = "${formattedDate}"
                 data-study="${item?.study}"
              class="btn btn-success info "  >
              <i style="pointer-events: none"  class="fa-solid fa-circle-info"></i>
                Infor
            </button></td>
                
                `;
                content.appendChild(tr);
            })
            // 
            const infors = document.querySelectorAll(".info");
            infors.forEach((infor, index) => {
                infor.addEventListener("click", async function (e) {
                    console.log("Count ++")
                    const teacher = infor.getAttribute("data-teacher");
                    const date = infor.getAttribute("data-date");
                    const dateI = infor.getAttribute("data-dateNow");
                    const study = infor.getAttribute("data-study");
                    const st = parseInt(study);
                    account.textContent = teacher;
                    date12.textContent = dateI;
                    study1.textContent = study;
                    editCoursePopup.classList.add('show');
                    // Render 
                    await renderLoadV2(st, new Date(date));
                });
            });
        } else {
            (content.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>');
        }


    }

    // Render infor 
    const renderLoadV2 = async (value, days) => {
        contentStudents.innerHTML = `
        <tr>
        <td colspan="5" class="py-5">
            <div class="d-flex mx-2 col-12 justify-content-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </td>
        </tr>`
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
        contentStudents.innerHTML = '';
        const listData = await response.json();

        const render = listData?.data?.data;
        console.log(render);
        render && render.length > 0 ? render.forEach((item, index) => {
            const status = item?.attendance ? 'Có mặt' : 'Vắng mặt';
            const color = item?.attendance ? 'text-success' : 'text-danger';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item?.studentAccount?.fullname}</td>
                <td>${item?.studentAccount?.phone}</td>
                <td class="${color}">${status}</td>
                <td>${item?.reason || ''}</td>
            `;
            contentStudents.appendChild(tr);
        }) : contentStudents.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
    }
    // Export btn
    exportBtn.addEventListener("click", async function () {
        const idTeacher = shift.value;
        const day = `${new Date(fromDate.value).getFullYear()}-${new Date(fromDate.value).getMonth() + 1}-${new Date(fromDate.value).getDate()}`;
        const day1 = `${new Date(toDate.value).getFullYear()}-${new Date(toDate.value).getMonth() + 1}-${new Date(toDate.value).getDate()}`;
        await renderLoad(day, day1, idTeacher);

    });




    // Handle Popup  
    cancelPopup.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });
    cancelPopup2.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });








});