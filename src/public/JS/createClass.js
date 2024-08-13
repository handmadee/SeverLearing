'use strict';

import { LOCALHOST_API_URL } from './config.js'

const loading = (contentClass) => {
    contentClass.innerHTML = ""
    contentClass.innerHTML = `
            <div style="position: absolute;" class="d-flex mx-2 col-12 justify-content-center">
                <div  class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
      `
}

const renderItemStudent = (content, data = []) => {
    console.log(data);
    if (data && data.length > 0) {
        // Create a DocumentFragment to accumulate HTML elements
        const fragment = document.createDocumentFragment();
        // Iterate over each item in the data array
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.classList.add('item');
            tr.style.height = '50px'; // Set the height of the row

            // Set the inner HTML of the table row
            tr.innerHTML = `
                <td>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value="${item._id}"
                      id="flexCheckChecked-${item._id}"
                    />
                  </div>
                </td>
                <td>${item.fullname}</td>
                <td>${item.phone}</td>
            `;

            fragment.appendChild(tr);
        });
        content.innerHTML = '';
        content.appendChild(fragment);
    } else {
        content.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    Giáo viên chưa được xếp lớp
                </td>
            </tr>
        `;
    }
};

const queryStudents = async (query) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}${query}`);
        const data = await response.json();
        return data?.data?.data
    } catch (err) {
        console.log(err)
        alert("Đã có lỗi xảy ra !")
    }
};







document.addEventListener('DOMContentLoaded', async () => {
    const accountTeacherSupper = await queryStudents('allSupper');
    const createClass = document.getElementById('createClass12');
    const addDayButton1 = document.getElementById('addDayButton1');
    const addTeacher = document.getElementById('addTeacher');
    const teacher1 = document.getElementById('teacher');
    const daysContainer1 = document.getElementById('daysContainer1');
    const nameClasss = document.getElementById('nameClass');
    const filterStudy = document.getElementById('filterStudy');
    const filterDays = document.querySelector('.daysFiler');
    const contentTable = document.getElementById('contentTable');
    const nameTeacher = document.querySelector('.teacher');
    const study = document.getElementById('study1');
    const content = document.querySelector('.createChapter');
    const students = document.querySelectorAll('form-check-input');


    const loadAndRenderStudents = async (query) => {
        loading(contentTable);
        const data = await queryStudents(query);
        renderItemStudent(contentTable, data);
    };

    // Initial load
    await loadAndRenderStudents('getStudentsAll');

    const handleFilterChange = async () => {
        const study = filterStudy.value;
        const days = filterDays.value;

        let query = '';
        if (study === 'all' && days === 'all') {
            query = 'getStudentsAll';
        } else if (study === 'all') {
            query = `getStudentsByDays?days=${days}`;
        } else if (days === 'all') {
            query = `getStudentsByStudy?study=${study}`;
        } else {
            query = `getStudentsByStudyByDays?study=${study}&days=${days}`;
        }

        await loadAndRenderStudents(query);
    };

    // Attach event listeners
    filterStudy.addEventListener('change', handleFilterChange);
    filterDays.addEventListener('change', handleFilterChange);



    function getCheckedStudents() {
        return Array.from(document.querySelectorAll('.form-check-input:checked')).map(el => el.value);
    }

    function getValues(selector) {
        return Array.from(document.querySelectorAll(selector)).map(el => parseInt(el.value));
    }


    function getIdTeacher(selector) {
        return Array.from(teacher1.querySelectorAll('.teacher')).filter(el => el.value !== '1').map(el => el.value);;
    }


    createClass.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log({
            data: {
                nameClass: nameClasss.value,
                teacherAccount: getIdTeacher(),
                study: parseInt(study.value),
                days: getValues('.days'),
                studentsAccount: getCheckedStudents()
            }
        });







        // Created class\   const renderLoad = async (date, date1, study) => {
        // content.innerHTML = `
        // <tr>
        // <td colspan="5" class="py-5">
        //     <div class="d-flex mx-2 col-12 justify-content-center">
        //         <div class="spinner-border text-success" role="status">
        //             <span class="visually-hidden">Loading...</span>
        //         </div>
        //     </div>
        // </td>
        // </tr>`


        try {
            const response = await fetch(`${LOCALHOST_API_URL}class`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nameClass: nameClasss.value,
                    teacherAccount: getIdTeacher(),
                    study: parseInt(study.value),
                    days: getValues('.days'),
                    studentsAccount: getCheckedStudents()
                }),
            });
            console.log(response)
            if (response.status == 201) {
                alert("Create suceess");
                location.reload();
            } else {
                alert("Tên lớp đã tồn tại")
            }
        } catch (error) {
            alert("Đã xảy ra lỗi với lỗi !")
        }
    });

    function addDayField1() {
        const days = document.querySelectorAll('.days');
        if (days.length >= 7) {
            addDayButton1.style.display = 'none';
            return createToast('error');
        }
        const dayEntry = document.createElement('div');
        dayEntry.className = 'input-group mb-2 day-entry';
        dayEntry.innerHTML = `
      <select class="form-select days mt-2" name="days" required>
        <option disabled>Ngày học học sinh trong tuần</option>
        <option value="2">Thứ 2</option>
        <option value="3">Thứ 3</option>
        <option value="4">Thứ 4</option>
        <option value="5">Thứ 5</option>
        <option value="6">Thứ 6</option>
        <option value="7">Thứ 7</option>
        <option value="8">Chủ nhật</option>
      </select>
      <button type="button" class="btn btn-danger remove-day mt-2">
        <i class="fa-solid fa-trash"></i>
      </button>
      <div class="invalid-feedback">Vui lòng chọn ngày học.</div>
    `;
        daysContainer1.appendChild(dayEntry);

        // Add event listener to remove button
        dayEntry.querySelector('.remove-day').addEventListener('click', () => {
            daysContainer1.removeChild(dayEntry);
            // Re-check the number of days after removing
            const daysCount = document.querySelectorAll('.days').length;
            if (daysCount < 7) {
                addDayButton1.style.display = 'block';
            }
        });
    }
    function createSelect() {
        const dayEntry = document.createElement('div');
        dayEntry.className = 'input-group mb-2 day-entry';

        // Tạo phần tử select
        const select = document.createElement('select');
        select.className = 'form-select teacher';
        select.name = 'teacher';
        select.required = true;

        // Tạo phần tử option mặc định
        const defaultOption = document.createElement('option');
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Giáo viên đứng lớp';
        defaultOption.value = 1;
        select.appendChild(defaultOption);

        // Duyệt qua mảng data và thêm các option vào select
        if (accountTeacherSupper && accountTeacherSupper.length > 0) {
            accountTeacherSupper.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.textContent = item.username;
                select.appendChild(option);
            });
        }

        // Thêm select vào dayEntry
        dayEntry.appendChild(select);

        // Tạo nút xóa
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-danger remove-day mt-2';
        removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

        // Thêm sự kiện xóa khi nhấn nút
        removeButton.addEventListener('click', () => {
            dayEntry.remove(); // Xóa phần tử dayEntry khỏi DOM
        });
        // Thêm nút xóa vào dayEntry
        dayEntry.appendChild(removeButton);
        // Thêm dayEntry vào container
        teacher1.appendChild(dayEntry);
    }


    // Function to add a new day field
    addDayButton1.addEventListener('click', addDayField1);
    addTeacher.addEventListener('click', createSelect);
});
