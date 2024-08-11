// Lịch học sinh
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';


document.addEventListener("DOMContentLoaded", function () {
    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");
    const inputSearch = document.getElementById('ipSearch');
    const btnSearch = document.getElementById('handlerSearch');
    const tableList = document.getElementById('tableList');

    // Function to render data into the table
    function renderTableData(data) {
        const tableList = document.getElementById('tableList');
        if (data && data.length > 0) {
            let tableHtml = '';
            data.forEach((user, index) => {
                tableHtml += `
                <tr>
                    <td scope="row">${index + 1}</td>
                     <td>${user._id}</td>
                    <td>${user.fullname}</td>
                    <td>${user.phone}</td>
                    <td>${user.study}</td>
                    <td>${user.days}</td>
                    <td>
                        <button value="${user._id}" class="btn btn-edit btn-primary accordion">
                            <i style="pointer-events: none" class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button value="${user._id}" class="btn btn-delete btn-danger">
                            <i style="pointer-events: none" class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            });
            tableList.innerHTML = tableHtml;
            // EVENTS
            const editButtons = document.querySelectorAll(".btn-edit");
            const deleteButtons = document.querySelectorAll(".btn-delete");
            // select 
            editButtons.forEach(button => {
                button.addEventListener("click", function (e) {
                    const id = e.target.value;
                    editCoursePopup.classList.add('show');
                    daysContainer.innerHTML = '';
                    fetchExam(id)
                });
            });
            // DELETE
            deleteButtons.forEach(button => {
                button.addEventListener("click", function (e) {
                    const id = e.target.value;
                    deleteStudent(id);
                });
            });

        } else {
            tableList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No data</td>
            </tr>`;
        }
    }


    btnSearch.addEventListener('click', async (e) => {
        e.preventDefault();
        const keyword = inputSearch.value.trim() || '';
        try {
            if (keyword.length > 0) {
                tableList.innerHTML = `
        <tr>
        <td colspan="5" class="py-5">
            <div class="d-flex mx-2 col-12 justify-content-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </td>
        </tr>`;
                const response = await fetch(`${LOCALHOST_API_URL}searchStudents/?qkeyword=${keyword}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const respon = await response.json();
                const data = respon.data.data;
                renderTableData(data)
            } else {
                this.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // importStudents.js
    async function importData() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('excelStudents', file);

            try {
                const response = await fetch(`${LOCALHOST_API_URL}importShechedule`, {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    alert('Import success');
                    location.reload();
                } else {
                    createToast('error')
                    console.error('Failed to upload file');
                }
            } catch (error) {
                createToast('error')
                console.error('Error uploading file:', error);
            }
        } else {
            alert('Please select a file to import.');
        }
    }

    const importButton = document.getElementById('importButton');
    importButton.addEventListener('click', importData);

    // delete students
    async function deleteStudent(id) {
        try {
            const response = await fetch(`${LOCALHOST_API_URL}deleteShechedule/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Delete success');
                location.reload();
            } else {
                createToast('error')
                console.error('Failed to delete data');
            }
        } catch (error) {
            createToast('error')
            console.error('Error deleting data:', error);
        }
    }

    // Delete
    deleteButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            deleteStudent(id);
        });
    });


    // Control trong popup
    const editCoursePopup = document.getElementById('editModal');
    const cancelPopup = document.getElementById('cancelPopup');
    const cancelPopup2 = document.getElementById('cancelPopup2');
    const savePopup = document.getElementById('savePopup');
    const daysContainer = document.getElementById('daysContainer');
    const addDayButton = document.getElementById('addDayButton');
    const days = document.querySelectorAll('.days');
    let currentIdStudent = null;


    // Popup 2 
    const importPersonal = document.getElementById('importPersonal');
    const editCoursePopup1 = document.getElementById('PersonalModal');
    const cancelPopup12 = document.getElementById('cancelPopup12');
    const cancelPopup1 = document.getElementById('cancelPopup1');
    const savePopup1 = document.getElementById('savePopup1');
    const daysContainer1 = document.getElementById('daysContainer1');
    const addDayButton1 = document.getElementById('addDayButton1');
    const days1 = document.querySelectorAll('.days');
    // Control trong popup
    cancelPopup1.addEventListener('click', function () {
        editCoursePopup1.classList.remove('show');
    });
    cancelPopup12.addEventListener('click', function () {
        editCoursePopup1.classList.remove('show');
    });
    // Function to add a new day field
    function addDayField1() {
        const days = document.querySelectorAll('.days');
        if (days.length >= 7) {
            addDayButton.style.display = 'none';
            return createToast('error')
        };
        const dayEntry = document.createElement('div');
        dayEntry.className = 'input-group mb-2 day-entry';
        dayEntry.innerHTML = `
      <select class="form-select days mt-2" name="days" required>
        <option disabled>Ngày học học sinh trong tuần</option>
        <option value=2>Thứ 2</option>
        <option value=3>Thứ 3</option>
        <option value=4>Thứ 4</option>
        <option value=5>Thứ 5</option>
        <option value=6>Thứ 6</option>
        <option value=7>Thứ 7</option>
        <option value=8>Chủ nhật</option>
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
        });

    }
    // Function to add a new day field
    addDayButton1.addEventListener('click', addDayField1)


    importPersonal.addEventListener('click', function () {
        editCoursePopup1.classList.add('show');
    });

    savePopup1.addEventListener('click', function () {
        const fullnamePop = document.getElementById('fullname1');
        const tel = document.getElementById('phone1');
        const studys = document.getElementById('study1');
        const indays = document.querySelectorAll('#daysContainer1 .days');
        const dataStudents = {
            fullname: fullnamePop.value,
            phone: tel.value,
            study: studys.value,
            days: Array.from(indays).map(day => day.value)
        }
        fetch(`${LOCALHOST_API_URL}importPersonal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataStudents)
        }).then(res => res.json()).then(data => {
            if (data.status === 200) {
                alert('Thêm lịch học thành công');
                location.reload();
            } else {
                createToast('error')
            }
        }).catch(err => {
            createToast('error')
        });
    });

    // Function to add a new day field
    function addDayField() {
        const days = document.querySelectorAll('.days');
        if (days.length >= 7) {
            addDayButton.style.display = 'none';
            return createToast('error')
        };
        const dayEntry = document.createElement('div');
        dayEntry.className = 'input-group mb-2 day-entry';
        dayEntry.innerHTML = `
      <select class="form-select days" name="days" required>
        <option disabled>Ngày học học sinh trong tuần</option>
        <option value=2>Thứ 2</option>
        <option value=3>Thứ 3</option>
        <option value=4>Thứ 4</option>
        <option value=5>Thứ 5</option>
        <option value=6>Thứ 6</option>
        <option value=7>Thứ 7</option>
        <option value=8>Chủ nhật</option>
      </select>
        <button type="button" class="btn btn-danger remove-day">
                    <i class="fa-solid fa-trash"></i>
                  </button>
      <div class="invalid-feedback">Vui lòng chọn ngày học.</div>
    `;
        daysContainer.appendChild(dayEntry);

        // Add event listener to remove button
        dayEntry.querySelector('.remove-day').addEventListener('click', () => {
            daysContainer.removeChild(dayEntry);
        });
    }

    addDayButton.addEventListener('click', addDayField)
    document.querySelectorAll('.remove-day').forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.closest('.day-entry').remove();
        });
    });
    // Control trong popup
    cancelPopup.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });
    cancelPopup2.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });
    // Control 
    editButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            daysContainer.innerHTML = '';
            editCoursePopup.classList.add('show');
            fetchExam(id)
        });
    });

    const fetchExam = async (id) => {
        try {
            const cousrse = await fetch(`${LOCALHOST_API_URL}getShechedule/${id}`)
            if (!cousrse.ok) {
                return createToast('error')
            }
            const data = await cousrse.json();
            const { fullname, phone, study, days } = data?.data?.data;
            currentIdStudent = id;
            renderExam(fullname, phone, study, days, id);
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const handlerUpdateStudents = async function () {
        const fullnamePop = document.getElementById('fullname');
        const tel = document.getElementById('phone');
        const studys = document.getElementById('study');
        const indays = document.querySelectorAll('#daysContainer .days');
        console.log({
            message: `[indays :: --]`,
            indays: indays
        })

        const dataStudents = {
            fullname: fullnamePop.value,
            phone: tel.value,
            study: studys.value,
            days: Array.from(indays).map(day => day.value)
        }
        await updateCourse(dataStudents, currentIdStudent)
    }


    const renderExam = async (fullname, phone, study, days, id) => {
        days.length > 0 && days.forEach((day, index) => {
            addDayField();
        });
        const fullnamePop = document.getElementById('fullname');
        const tel = document.getElementById('phone');
        const studys = document.getElementById('study');
        const indays = document.querySelectorAll('#daysContainer .days');
        fullnamePop.value = fullname;
        tel.value = phone;
        studys.value = study;
        indays.forEach((day, index) => {
            day.value = days[index];
        });

        savePopup.removeEventListener('click', handlerUpdateStudents);
        savePopup.addEventListener('click', handlerUpdateStudents);


        // 

    }

    const updateCourse = async (data, courseid) => {
        try {
            const cousrse = await fetch(`${LOCALHOST_API_URL}updateSchedule/${courseid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            console.log(cousrse)
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật lịch học thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


});