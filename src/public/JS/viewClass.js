
import { LOCALHOST_API_URL } from "./config.js"

const getEL = (id) => document.getElementById(id);
const getCL = (id) => document.querySelector(id);
const getAllCL = (id) => document.querySelectorAll(id);

const renderItem = (content, data = []) => {
    console.log(data);
    if (data && data.length > 0) {
        const fragment = document.createDocumentFragment();
        data.forEach((item) => {
            const div = document.createElement('div');
            div.classList.add('itemClass');
            div.dataset.id = item._id;
            div.innerHTML = `
                <p>${item?.nameClass}</p>
                <p><span>Số lượng học sinh: </span>${item?.studentsAccount.length}</p>
                <p><span>Ca dạy: </span>${item?.study}</p>
                <p><span>Ngày dạy: </span>${item?.days}</p>
                <div class="control">
                  <div data-id = ${item._id}  class="btnClass delClass" >
                    <i class="fa-solid fa-trash"></i>
                  </div>
                  <div data-id  = ${item._id}  class="btnClass editClass" >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </div>
                </div>
            `;
            fragment.appendChild(div);
        });
        content.innerHTML = '';
        content.appendChild(fragment);
        // Đã được tạo viết logic bên trong này

    } else {
        content.innerHTML = `
        <h5 style="    text-align: center;
">Giáo viên chưa được xếp lớp</h5>
        `
    }
};
const renderItemStudent = (content, data = []) => {
    console.log(data);
    if (data && data.length > 0) {
        // Create a DocumentFragment to accumulate HTML elements
        const fragment = document.createDocumentFragment();
        // Iterate over each item in the data array
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.classList.add('item');
            // Set the inner HTML of the table row
            tr.innerHTML = `
                <td><strong>${index + 1}</strong></td>
               <td>${item?._id}</td>
                <td>${item?.fullname}</td>
                <td>${item?.phone}</td>
                <td>
                     <button class="Evaluate1"  data-teacher="${item.phone}"  data-phone="${item.phone}" data-name="${item.fullname}" data-id="${item._id}">
                    <i class="fa-solid fa-street-view"></i>
                    Đánh giá
                  </button>
                  <button  class="Trash1"  data-phone="${item.phone}" data-name="${item.fullname}" data-id="${item._id}">
                    <i class="fa-solid fa-trash"></i>
                    Xoá
                  </button>
                </td>
            `;

            // Append the new row to the DocumentFragment
            fragment.appendChild(tr);
        });

        // Append the DocumentFragment to the content element
        content.innerHTML = ''; // Clear previous content
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
const getClassByTeacherI = async (id) => {
    const response = await fetch(`${LOCALHOST_API_URL}class/${id}`);
    if (!response.ok) {
        return createToast("error");
    }
    return response;
}
const deleteClass = async (id) => {
    try {
        await fetch(`${LOCALHOST_API_URL}class/${id}`, {
            method: "DELETE"
        });
        alert("XOÁ THÀNH CÔNG");
        location.reload();
    } catch (error) {
        console.log(error);
        alert("đã có lỗi xảy ra khi xoá class")
    }
}
const getClassID = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}classByID/${id}`)
}
const getAllStudentInClass = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}allStudentInClass/${id}`)
}
const getFeedBackByIdForMonth = async (id, month) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/students/${id}?month=${month}`);
        const data = await response.json();
        return data.data.data;
    } catch (error) {
        alert("Đã xảy ra lỗi get FeedBack !")
    }
}
const editClassV = async (id, body) => {
    return await fetch(`${LOCALHOST_API_URL}class/${id}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}
const createFeedBack = async (body) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        const data = response.json();
        if (data) {
            alert("Tạo thông đánh giá thành công")
            location.reload();
        };
    } catch (error) {
        console.log(error)
        alert("Tạo thông đánh giá thất bại");
    }
}
const removeStudents = async (idClass, idStudents) => {
    return await fetch(`${LOCALHOST_API_URL}classStudents/removeStudent`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idClass,
            idStudents
        })
    })
}

const addStudentsV1 = async (idClass, idStudents) => {
    return await fetch(`${LOCALHOST_API_URL}classAddStudent`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idClass,
            idStudents: [idStudents]
        })
    })

}

async function fetchAndRenderClasses(teacherId, contentClass) {
    let listData;
    if (teacherId === 'all') {
        const response = await fetch(`${LOCALHOST_API_URL}class`);
        listData = await response.json();
    } else {
        const data = await getClassByTeacherI(teacherId);
        listData = await data.json();
    }

    const render = listData?.data?.data;
    await renderItem(contentClass, render);
}



document.addEventListener('DOMContentLoaded', async () => {
    const monthNow = new Date().getMonth() + 1;
    tinymce.init({
        selector: '#EvaluateContent'
    });
    const contentClass = getEL("contentClass");
    const selectTeacher = getCL(".teacher");
    const idTeacher = getEL("teacher");
    const showAllStudents = getEL("showAllStudents");
    const contentTableShowAllStudents = getEL("contentTable");
    const IdStudentsAdd = getEL("IdStudentsAdd")
    const addStudents = getEL("addStudents")
    const nameClassD = getEL("nameClassD");
    const dialogReview = getCL(".dialogReview");
    const EvaluateContent = getEL("EvaluateContent");

    const nameStudents = dialogReview.querySelector('.nameStudents');
    const phoneStudents = dialogReview.querySelector('.phoneStudents')
    const createEvaluate = dialogReview.querySelector('.createEvaluate')
    dialogReview.querySelector('.xmark').addEventListener("click", () => dialogReview.style.display = "none")

    showAllStudents.querySelector(".xmark").addEventListener("click", () => {
        showAllStudents.classList.remove('show')
        dialogReview.style.display = "none"
    })

    // Edit 

    // Select delete and editS

    const dialogEditClass = getEL("dialogEditClass");
    const saveClass = getEL("saveClass");

    dialogEditClass.querySelector(".xmark").addEventListener('click', () => dialogEditClass.classList.remove("show"))
    const nameClass = getEL("nameClass");
    const teacher = getEL("pemission");
    const study1 = getEL("study1");
    const daysContainer1 = getEL("daysContainer1");
    const addDayButton1 = getEL("addDayButton1");

    // Function to add a new day field
    function addDayField() {
        const days = document.querySelectorAll('.days');
        if (days.length >= 7) {
            addDayButton1.style.display = 'none';
            return createToast('error');
        }
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
        daysContainer1.appendChild(dayEntry);

        // Add e listener to remove button
        dayEntry.querySelector('.remove-day').addEventListener('click', () => {
            daysContainer1.removeChild(dayEntry);
        });
    }
    // teacher 
    function createSelect(accountTeacherSupper = []) {
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






    //  save edit class
    saveClass.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = e.target.dataset.id;
        const indays = document.querySelectorAll('#daysContainer1 .days');
        console.log(indays)
        const days = Array.from(indays).map(item => +item.value);
        const body = {
            nameClass: nameClass.value,
            teacherAccount: teacher.value,
            study: +study1.value,
            days: days
        }
        try {
            const data = await editClassV(id, body);
            const listData = await data.json();
            const render = listData?.data?.data;
            if (render) {
                alert("Chỉnh sửa thành công");
                location.reload();
            } else {
                alert("Không thành công !!");
            }
        } catch (error) {
            alert("Có vẻ tên đã tồn tại");
        }

    });
    addDayButton1.addEventListener('click', addDayField);
    loading(contentClass);



    if (selectTeacher.value == 'all') {
        const response = await fetch(`${LOCALHOST_API_URL}class`)
        contentClass.innerHTML = ''
        const listData = await response.json();
        const render = listData?.data?.data;
        await renderItem(contentClass, render);
    } else {
        // const data = await getClassByTeacherI(selectTeacher.value);
        // const listData = await data.json();
        // console.log(listData)
        // const render = listData?.data?.data;
        // await renderItem(contentClass, render);

        fetchAndRenderClasses(selectTeacher.value, contentClass);
    }
    selectTeacher.addEventListener('change', async (e) => {
        if (e.target.value == "all") {
            location.reload();
        };
        loading(contentClass);
        // const data = await getClassByTeacherI(e.target.value);
        // const listData = await data.json();
        // console.log(listData)
        // const render = listData?.data?.data;
        // await renderItem(contentClass, render);
        fetchAndRenderClasses(e.target.value, contentClass);
    });





    let payload123 = null;
    contentClass.addEventListener("click", async (e) => {
        const target = e.target;
        if (target.classList.contains("itemClass")) {
            const id = e.target.dataset.id;
            addStudents.dataset.id = id;
            if (e.target.className.includes("btnClass") || e.target.className == "") return;
            showAllStudents.classList.add('show');
            loading(contentTableShowAllStudents);
            const data = await getAllStudentInClass(id);
            const listData = await data.json();
            console.log(listData)
            nameClassD.innerText = listData?.data?.data.nameClass;
            const render = listData?.data?.data?.studentsAccount;
            renderItemStudent(contentTableShowAllStudents, render);
            contentTableShowAllStudents.addEventListener('click', async (e) => {
                const target = e.target;
                if (target.classList.contains("Evaluate1")) {
                    const id = target.dataset.id;
                    const name = target.dataset.name;
                    const phone = target.dataset.phone;
                    // Tìm kiếm trong tháng
                    console.log(monthNow)
                    const foundFeddBack = await getFeedBackByIdForMonth(id, +monthNow);
                    console.log(foundFeddBack)
                    if (foundFeddBack[0]) {
                        tinymce.get('EvaluateContent').setContent(foundFeddBack[0]?.contentFeedBack);
                    } else {
                        tinymce.get('EvaluateContent').setContent("");
                    }
                    nameStudents.innerText = name;
                    phoneStudents.innerHTML = `<span >SĐT Phụ Huynh: </span >${phone}`;
                    dialogReview.style.display = "block";
                    payload123 = {
                        idTeacher: idTeacher.dataset.id,
                        idStudent: id,
                    }
                } else if (target.classList.contains("Trash1")) {
                    const idStudents = target.dataset.id;
                    try {
                        const response = await removeStudents(id, idStudents);
                        const data = await response.json();
                        if (data) {
                            alert("Xoá sinh viên thành công !");
                            location.reload();
                        }
                    } catch (error) {
                        alert("Xoá sinh viên thất bại !")
                    }
                }
            });



        }
        else if (target.classList.contains("delClass")) {
            const id = e.target.dataset.id;
            await deleteClass(id)

        } else if (target.classList.contains("editClass")) {
            const id = e.target.dataset.id;
            const data = await getClassID(id);
            const listData = await data.json();
            const render = listData?.data?.data;



            daysContainer1.innerHTML = "";
            if (render.days.length > 0) {
                render.days.forEach(() => {
                    addDayField();
                });
            }


            const indays = document.querySelectorAll('#daysContainer1 .days');
            nameClass.value = render.nameClass;
            teacher.value = render.teacherAccount[0]._id;
            study1.value = render.study;
            saveClass.dataset.id = render._id
            indays.forEach((day, index) => {
                day.value = render.days[index];
            });
            dialogEditClass.classList.add("show");
            document.querySelectorAll('.remove-day').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.target.closest('.day-entry').remove();
                });
            });
        }
    });
    createEvaluate.addEventListener("click", async () => {
        const content = tinymce.get('EvaluateContent').getContent();
        return await createFeedBack({
            ...payload123, content
        })
    });
    // add students 

    addStudents.addEventListener("click", async (e) => {
        if (IdStudentsAdd.value.trim() == "") {
            alert("Không dược để trống id sinh viên");
            return;
        }
        try {
            const data = await addStudentsV1(e.target.dataset.id, IdStudentsAdd.value);
            const response = await data.json();
            if (response) {
                alert("Thêm sinh viên thành công");
                location.reload();
            }
        } catch (error) {
            alert("Đã có lỗi xảy ra với sinh viên ");
        }

    })





















});



