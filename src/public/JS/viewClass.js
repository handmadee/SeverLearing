
import { createToast } from "./Aleart.js";
import { LOCALHOST_API_URL } from "./config.js"


const getEL = (id) => document.getElementById(id);
const getCL = (id) => document.querySelector(id);

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
            // let id = String(item?._id).substring(0, 6);
            tr.innerHTML = `
                <td  ><strong>${index + 1}</strong></td>
               <td  >${item?._id}</td>
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
            // location.reload();
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
    const containerTeacher = getEL("containerTeacher");
    const EvaluateContent = getEL("EvaluateContent");
    const Ts1 = document.querySelectorAll('.language');
    const nameStudents = dialogReview.querySelector('.nameStudents');
    const phoneStudents = dialogReview.querySelector('.phoneStudents')
    const createEvaluate = dialogReview.querySelector('.createEvaluate')


    dialogReview.querySelector('.xmark').addEventListener("click", () => dialogReview.style.display = "none")

    showAllStudents.querySelector(".xmark").addEventListener("click", () => {
        showAllStudents.classList.remove('show')
        dialogReview.style.display = "none"
    })

    const dialogEditClass = getEL("dialogEditClass");
    const saveClass = getEL("saveClass");
    dialogEditClass.querySelector(".xmark").addEventListener('click', () => dialogEditClass.classList.remove("show"))
    const nameClass = getEL("nameClass");
    const teacher = getEL("pemission");
    const teacher1 = getEL("pemission1");
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
    // Copy ID
    contentTableShowAllStudents.addEventListener('click', function (e) {
        const target = e.target;
        const row = target.closest('tr');
        if (target.classList.contains('Evaluate1') || target.classList.contains('Trash1')) {
            return;
        }
        if (row) {
            const idCell = row.children[1];
            if (idCell) {
                const id = idCell.textContent;
                navigator.clipboard.writeText(id)
                    .then(() => {
                        // Tạo thông báo
                        const notification = document.createElement('div');
                        notification.textContent = 'Đã sao chép ID!';
                        notification.style.cssText = `
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: #4CAF50;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 4px;
                            animation: fadeOut 2s forwards;
                            z-index: 1000;
                        `;

                        // Thêm keyframes animation
                        const style = document.createElement('style');
                        style.textContent = `
                            @keyframes fadeOut {
                                0% { opacity: 1; }
                                70% { opacity: 1; }
                                100% { opacity: 0; }
                            }
                        `;
                        document.head.appendChild(style);

                        // Thêm thông báo vào body
                        document.body.appendChild(notification);

                        // Xóa thông báo sau khi animation kết thúc
                        setTimeout(() => {
                            notification.remove();
                            style.remove();
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Không thể sao chép:', err);
                        alert('Không thể sao chép ID!');
                    });
            }
        }
    });

    //  save edit class
    saveClass.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = e.target.dataset.id;
        const indays = document.querySelectorAll('#daysContainer1 .days');
        const inTechers = containerTeacher.querySelectorAll(".selectTeacher");
        console.log(indays)
        const days = Array.from(indays).map(item => +item.value);
        // teacher
        const teachers = Array.from(inTechers).filter(item => item.style.display != 'none').map(item => item.value);
        console.log(teachers)
        const body = {
            nameClass: nameClass.value,
            teacherAccount: teachers,
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
        fetchAndRenderClasses(selectTeacher.value, contentClass);
    }
    selectTeacher.addEventListener('change', async (e) => {
        if (e.target.value == "all") {
            location.reload();
        };
        loading(contentClass);
        fetchAndRenderClasses(e.target.value, contentClass);
    });



    let payload123 = null;
    contentClass.addEventListener("click", async (e) => {
        const target = e.target;
        console.log(target);
        if (target.classList.contains("itemClass")) {
            const id = e.target.dataset.id;
            addStudents.dataset.id = id;
            if (e.target.className.includes("btnClass") || e.target.className == "") return;
            showAllStudents.classList.add('show');
            loading(contentTableShowAllStudents);
            const data = await getAllStudentInClass(id);
            const listData = await data.json();
            console.log(listData);
            nameClassD.innerText = listData?.data?.data.nameClass;
            const render = listData?.data?.data?.studentsAccount;
            renderItemStudent(contentTableShowAllStudents, render);
            //! thiếu 


            showAllStudents.removeAttribute('click')
            showAllStudents.addEventListener('click', async (e) => {
                const target = e.target;
                console.log(target)
                //! Đánh giá
                if (target.classList.contains("Evaluate1")) {
                    const id = target.dataset.id;
                    const name = target.dataset.name;
                    const phone = target.dataset.phone;

                    try {
                        console.log(monthNow);
                        const foundFeedBack = await getFeedBackByIdForMonth(id, +monthNow);
                        const dataV = foundFeedBack[0] || {};
                        const content = dataV?.contentFeedBack || "";
                        tinymce.get('EvaluateContent').setContent(content);
                        // Hiển thị thông tin học sinh
                        nameStudents.innerText = name || "";
                        if (phoneStudents) {
                            phoneStudents.innerHTML = `<span>SĐT Phụ Huynh: </span>${phone || ""}`;
                        }
                        // Xoá nội dung cũ trong các trường nếu không có dữ liệu
                        const Ts1Array = Array.from(Ts1);
                        Ts1Array.forEach((item) => {
                            const selectElement = item.querySelector('select');
                            if (selectElement) {
                                selectElement.value = ""; // Đặt lại giá trị rỗng
                            }
                            const inputElement = item.querySelector('input');
                            if (inputElement) {
                                inputElement.value = ""; // Đặt lại giá trị rỗng
                            }
                        });

                        // Cập nhật điểm số môn học nếu có
                        if (dataV?.subjectScores?.length > 0) {
                            dataV.subjectScores.forEach((LG) => {
                                const matchedElement = Ts1Array.find((item) => item.dataset.id === LG.languageIt._id);
                                if (matchedElement) {
                                    const selectElement = matchedElement.querySelector('select');
                                    if (selectElement) {
                                        selectElement.value = LG.level;
                                    }

                                    const inputElement = matchedElement.querySelector('input');
                                    if (inputElement) {
                                        inputElement.value = LG.score;
                                    }
                                }
                            });
                        }

                        // Xoá trạng thái radio buttons nếu không có dữ liệu
                        document.querySelectorAll('input[name="programming-skill"]').forEach((radio) => {
                            radio.checked = false; // Bỏ chọn tất cả trước
                        });
                        document.querySelectorAll('input[name="thinking-skill"]').forEach((radio) => {
                            radio.checked = false; // Bỏ chọn tất cả trước
                        });

                        // Cập nhật giá trị radio buttons nếu có
                        if (dataV?.skill) {
                            document.querySelectorAll('input[name="programming-skill"]').forEach((radio) => {
                                if (radio.value === dataV.skill) {
                                    radio.checked = true;
                                }
                            });
                        }
                        if (dataV?.thinking) {
                            document.querySelectorAll('input[name="thinking-skill"]').forEach((radio) => {
                                if (radio.value === dataV.thinking) {
                                    radio.checked = true;
                                }
                            });
                        }

                        // Hiển thị dialog review
                        dialogReview.style.display = "block";

                        // Thiết lập payload cho các tác vụ sau
                        payload123 = {
                            idTeacher: idTeacher.dataset.id,
                            idStudent: id,
                        };
                    } catch (error) {
                        console.error("Error while evaluating feedback:", error);
                        alert("Có lỗi xảy ra khi tải dữ liệu đánh giá. Vui lòng thử lại sau!");
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
                } else if (target.classList.contains("addStudentsv")) {
                    e.preventDefault();
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
                }
            });
            const handleCreateEvaluate = async () => {
                const subjectScores = [];
                const content = tinymce.get('EvaluateContent').getContent();
                const skill = getCL('input[name="programming-skill"]:checked')?.value;
                const thinking = getCL('input[name="thinking-skill"]:checked')?.value;
                if (!skill || skill == '' && !thinking || thinking == '') {
                    return alert('Không được để trống các Kĩ Năng ')
                }
                Ts1.forEach((item) => {
                    let level = item.querySelector('select')?.value
                    let score = +item.querySelector('input')?.value;
                    if (level && score) {
                        subjectScores.push({
                            languageIt: item.dataset.id,
                            level,
                            score
                        })
                    }
                });
                await createFeedBack({
                    ...payload123,
                    subjectScores,
                    content,
                    skill,
                    thinking
                });
                dialogReview.style.display = "none"
            }
            // const handleCreateStudents = async (e) => {


            // };
            dialogReview.addEventListener('click', async (e) => {
                if (e.target.classList.contains('createEvaluate')) {
                    return await handleCreateEvaluate();
                }
            });
            // addStudents.removeEventListener('click', handleCreateStudents);
            // addStudents.addEventListener('click', handleCreateStudents);
        } else if (target.classList.contains("delClass")) {
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
            };
            const indays = document.querySelectorAll('#daysContainer1 .days');
            nameClass.value = render.nameClass;
            teacher.value = render.teacherAccount[0]._id;
            if (render.teacherAccount[1]) {
                teacher1.value = render.teacherAccount[1]._id;
                teacher1.style.display = '';
            } else {
                teacher1.style.display = 'none';
            }
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
});


