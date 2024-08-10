'use strict';
import { LOCALHOST_API_URL } from './config.js'


document.addEventListener('DOMContentLoaded', function () {
    const shift = document.getElementById("shift");
    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");
    const exportBtn = document.getElementById("export");
    const content = document.getElementById("attendanceTable");
    // Control date
    // Control trong popup
    const editCoursePopup = document.getElementById('editModal');
    const cancelPopup = document.getElementById('cancelPopup');
    const cancelPopup2 = document.getElementById('cancelPopup2');
    const fullname = document.getElementById('fullName');
    const emptyTable = document.getElementById('absentTable');
    const schoolBoard
        = document.getElementById('presentTable');

    // @infor 
    const phoneC = document.getElementById('phoneC');
    const studyC = document.getElementById('studyC');



    const renderLoad = async (date, date1, study) => {
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
        const response = await fetch(`${LOCALHOST_API_URL}attendanceTeacherByDate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ study, date, date1 }),
        });
        content.innerHTML = ''
        if (!response.ok) {
            return createToast("error");
        }
        const listData = await response.json();
        console.log(listData)
        const render = listData?.data?.data;
        console.log(render)
        if (render && render.length > 0) {
            render.forEach((item, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item?.fullname}</td>
                <td
                class="text-success"
                >${item?.attendanceCountTrue}</td>
                <td 
                  class="text-danger"
                >${item?.attendanceFalseCount}</td>
                <td>  <button
                 data-name="${item?.fullname}"
                 data-study="${item?.study}"
                 data-phone="${item?.phone}"
                 value="${item?.accountID}"
              class="btn btn-success delete"  >
              <i style="pointer-events: none"  class="fa-solid fa-circle-info"></i>
                Infor
            </button></td>
                
                `;
                content.appendChild(tr);
            })
            // 
            const infors = document.querySelectorAll(".delete");
            infors.forEach((infor, index) => {
                infor.addEventListener("click", async function () {
                    const id = infor.value;
                    const name = infor.getAttribute("data-name");
                    const studyD = infor.getAttribute("data-study");
                    const phoneD = infor.getAttribute("data-phone");
                    fullname.textContent = name;
                    phoneC.textContent = phoneD;
                    studyC.textContent = studyD;
                    editCoursePopup.classList.add('show');
                    // Loading
                    emptyTable.innerHTML = `
        <tr>
        <td colspan="5" class="py-5">
            <div class="d-flex mx-2 col-12 justify-content-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </td>
        </tr>`
                    const response = await fetch(`${LOCALHOST_API_URL}getAttendanceAloneByAccount/${id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ study, date, date1 }),
                    });
                    if (!response.ok) {
                        return createToast("error");
                    }
                    const arr = await response.json();
                    const render1 = arr?.data?.data;
                    console.log({
                        message: `[render]:: `,
                        render: render1
                    })
                    const absent = render1.filter((item) => item.attendance === false);
                    const present = render1.filter((item) => item.attendance === true);
                    // RENDER 
                    emptyTable.innerHTML = "";
                    absent && absent.length > 0 ? absent.forEach((item, index) => {
                        const study = new Date(item?.date);
                        const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).format(study);
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                        <td  colspan="2" ><strong>Ngày Học</strong> ${formattedDate}</td>
                        <td colspan="1" ><strong>Ca Học</strong> ${item?.study}</td>
                         <td colspan="2" ><strong>Ghi chú</strong>: ${item?.reason}</td>
                        `;
                        emptyTable.appendChild(tr);
                    }) : emptyTable.innerHTML = '<tr><td colspan="1" class="text-center">Không có dữ liệu</td></tr>';

                    schoolBoard.innerHTML = "";
                    present && present.length > 0 ? present.forEach((item, index) => {
                        const study = new Date(item?.date);
                        const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).format(study);
                        const tr = document.createElement("tr");
                        tr.ATTRIBU
                        tr.innerHTML = `
                        <td  colspan="2" ><strong>Ngày Học</strong> ${formattedDate}</td>
                        <td colspan="1" ><strong>Ca Học</strong> ${item?.study}</td>
                         <td colspan="2" ><strong>Ghi chú</strong>: ${item?.reason}</td>
                        `;
                        schoolBoard.appendChild(tr);
                    }) : schoolBoard.innerHTML = '<tr><td colspan="1" class="text-center">Không có dữ liệu</td></tr>';









                });
            });
        } else {
            (content.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
        }


    }

    exportBtn.addEventListener("click", async function () {
        const study = parseInt(shift.value);
        const day = `${new Date(fromDate.value).getFullYear()}-${new Date(fromDate.value).getMonth() + 1}-${new Date(fromDate.value).getDate()}`;
        const day1 = `${new Date(toDate.value).getFullYear()}-${new Date(toDate.value).getMonth() + 1}-${new Date(toDate.value).getDate()}`;
        await renderLoad(day, day1, study);
        console.log(study, day, day1);
    });

    // Handle Popup  
    cancelPopup.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });
    cancelPopup2.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });








});