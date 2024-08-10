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
    return await fetch(`${LOCALHOST_API_URL}class/${id}`, {
        method: "DELETE"
    });
}
const getClassID = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}classByID/${id}`)
}
const getAllStudentInClass = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}allStudentInClass/${id}`)
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
        if (data) alert("Tạo thông đánh giá thành công");
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



document.addEventListener('DOMContentLoaded', async () => {
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
    // load lớp 
    loading(contentClass)
    // call 
    const response = await fetch(`${LOCALHOST_API_URL}class`)
    contentClass.innerHTML = ''
    const listData = await response.json();
    const render = listData?.data?.data;
    await renderItem(contentClass, render);
    // Select 
    selectTeacher.addEventListener('change', async (event) => {
        if (event.target.value == "all") return location.reload();
        loading(contentClass);
        const data = await getClassByTeacherI(event.target.value);
        const listData = await data.json();
        console.log(listData)
        const render = listData?.data?.data;
        await renderItem(contentClass, render);
    });

    contentClass.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("itemClass")) {

        } else if (target.classList.contains("delClass")) {

        } else if (target.classList.contains("editClass")) {

        }
    });





    // Select delete and editS
    const deleteClass = getAllCL(".delClass");
    const editClass = getAllCL(".editClass");
    const dialogEditClass = getEL("dialogEditClass");
    const saveClass = getEL("saveClass");
    // Remove
    deleteClass.forEach((item) => {
        {
            item.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                console.log(id)
            })
        }
    })





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

        // Add event listener to remove button
        dayEntry.querySelector('.remove-day').addEventListener('click', () => {
            daysContainer1.removeChild(dayEntry);
        });
    }

    //  save edit class
    saveClass.addEventListener("click", async (event) => {
        event.preventDefault();
        const id = event.target.dataset.id;
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
    // Set up initial click event listeners for items
    editClass.forEach((item) => {
        item.addEventListener('click', async (event) => {
            const id = event.target.dataset.id;
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
            teacher.value = render.teacherAccount._id;
            study1.value = render.study;
            saveClass.dataset.id = render._id
            indays.forEach((day, index) => {
                day.value = render.days[index];
            });
            dialogEditClass.classList.add("show");
            document.querySelectorAll('.remove-day').forEach(button => {
                button.addEventListener('click', (event) => {
                    event.target.closest('.day-entry').remove();
                });
            });
        });
    });

    let payload = {}
    const handleShowList = async (event) => {
        const id = event.target.dataset.id;
        if (event.target.className.includes("btnClass") || event.target.className == "") return;
        showAllStudents.classList.add('show');
        loading(contentTableShowAllStudents);
        const data = await getAllStudentInClass(id);
        const listData = await data.json();
        console.log(listData)
        nameClassD.innerText = listData?.data?.data.nameClass;
        const render = listData?.data?.data?.studentsAccount;
        renderItemStudent(contentTableShowAllStudents, render);

        // Evaluates
        const evaluates = getAllCL(".Evaluate1");
        const trashs = getAllCL(".Trash1");
        evaluates.forEach((item) => {
            item.removeEventListener("click", (event) => handlerEven(event));
            item.addEventListener("click", (event) => handlerEven(event));

        });
        trashs.forEach((item) => {
            item.addEventListener("click", async (event) => {
                const idStudents = event.target.dataset.id; // students
                console.log({
                    idStudents,
                    idClass: id
                });

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
            })
        });
        // created 
        addStudents.addEventListener("click", async (e) => {
            if (IdStudentsAdd.value.trim() == "") {
                alert("Không dược để trống id sinh viên");
                return;
            }
            console.log(id, IdStudentsAdd.value)
            try {
                const data = await addStudentsV1(id, IdStudentsAdd.value);
                const response = await data.json();
                if (response) {
                    alert("Thêm sinh viên thành công");
                    location.reload();
                }
            } catch (error) {
                alert("Đã có lỗi xảy ra với sinh viên ");
            }

        })
    }

    const handlerEdit = async (body) => {
        try {
            const response = await createFeedBack(body);
            if (response.json()) {
                alert("Tạo thông báo thành công !")
                location.reload();
            }
        } catch (error) {
            alert("Thông báo thất bại !")
        }
    }
    const handlerEven = (event) => {
        const targerName = event.target.className;
        console.log(targerName)
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;
        const phone = event.target.dataset.phone;
        nameStudents.innerText = name;
        phoneStudents.innerHTML = `<span >SĐT Phụ Huynh: </span >${phone}`;
        EvaluateContent.value;
        dialogReview.style.display = "block";
        payload = {
            idTeacher: idTeacher.dataset.id,
            idStudent: id,
            content: EvaluateContent.value
        }

        // Save 
    }


    createEvaluate.addEventListener("click", () => handlerEdit(payload));
    // Show S 
    const itemClasss = getAllCL(".itemClass");
    itemClasss.forEach((item) => {
        item.removeEventListener("click", (event) => handleShowList(event))
        item.addEventListener("click", (event) => handleShowList(event))
    });
});



