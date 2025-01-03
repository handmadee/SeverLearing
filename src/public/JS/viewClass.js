
/*************************************************
 *  Imports và constants
 *************************************************/
import { createToast } from "./Aleart.js";
import { LOCALHOST_API_URL } from "./config.js";


// Selector rút gọn
const getEL = (id) => document.getElementById(id);
const getCL = (id) => document.querySelector(id);

/*************************************************
 *  Các hàm fetch
 *************************************************/
const getClassByTeacherI = async (id) => {
    const response = await fetch(`${LOCALHOST_API_URL}class/${id}`);
    if (!response.ok) {
        return createToast("error");
    }
    return response;
};

const deleteClass = async (id) => {
    try {
        await fetch(`${LOCALHOST_API_URL}class/${id}`, {
            method: "DELETE",
        });
        alert("XOÁ THÀNH CÔNG");
        location.reload();
    } catch (error) {
        console.log(error);
        alert("đã có lỗi xảy ra khi xoá class");
    }
};

const getClassID = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}classByID/${id}`);
};

const getAllStudentInClass = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}allStudentInClass/${id}`);
};

const getFeedBackByIdForMonth = async (id, month) => {
    try {
        const response = await fetch(
            `${LOCALHOST_API_URL}feedback/students/${id}?month=${month}`
        );
        const data = await response.json();
        return data.data.data;
    } catch (error) {
        alert("Đã xảy ra lỗi get FeedBack !");
    }
};

const editClassV = async (id, body) => {
    return await fetch(`${LOCALHOST_API_URL}class/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
};

const createFeedBack = async (body) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = response.json();
        if (data) {
            alert("Tạo thông đánh giá thành công");
            // location.reload();
        }
    } catch (error) {
        console.log(error);
        alert("Tạo thông đánh giá thất bại");
    }
};
const createFileFeedBack = async (body) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}create-file/feedback`, {
            method: "POST",
            body: body,
        });
        const data = await response.json();

        if (data) {
            console.log(data);
            alert(`
                Tạo đánh giá thành công\n
                Số đánh giá được sửa đổi ${data.data.modifiedCount}`);
            location.reload();
        }
    } catch (error) {
        console.log(error);
        alert("Tạo thông đánh giá thất bại");
    }
};

const createFeedBackBulk = async (body) => {
    try {
        console.log(body);
        const response = await fetch(`${LOCALHOST_API_URL}create-bulk/feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = response.json();
        if (data) {
            alert("Tạo thông đánh giá thành công");
            location.reload();
        }
    } catch (error) {
        console.log(error);
        alert("Tạo thông đánh giá thất bại");
    }
};



const removeStudents = async (idClass, idStudents) => {
    return await fetch(`${LOCALHOST_API_URL}classStudents/removeStudent`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            idClass,
            idStudents,
        }),
    });
};






const addStudentsV1 = async (idClass, idStudents) => {
    return await fetch(`${LOCALHOST_API_URL}classAddStudent`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            idClass,
            idStudents: [idStudents],
        }),
    });
};

/*************************************************
 *  Các hàm render
 *************************************************/
const renderItem = (content, data = []) => {
    console.log(data);
    if (data && data.length > 0) {
        const fragment = document.createDocumentFragment();
        data.forEach((item) => {
            const div = document.createElement("div");
            div.classList.add("itemClass");
            div.dataset.id = item._id;
            div.innerHTML = `
          <p>${item?.nameClass}</p>
          <p><span>Số lượng học sinh: </span>${item?.studentsAccount.length
                }</p>
          <p><span>Ca dạy: </span>${item?.study}</p>
          <p><span>Ngày dạy: </span>${item?.days}</p>
          <div class="control">
            <div data-id="${item._id}" class="btnClass delClass">
              <i class="fa-solid fa-trash"></i>
            </div>
            <div data-id="${item._id}" class="btnClass editClass">
              <i class="fa-solid fa-pen-to-square"></i>
            </div>
          </div>
      `;
            fragment.appendChild(div);
        });
        content.innerHTML = "";
        content.appendChild(fragment);
    } else {
        content.innerHTML = `
      <h5 style="text-align: center;">
        Giáo viên chưa được xếp lớp
      </h5>
    `;
    }
};

async function showBulkFeedbackDialog() {
    const selectFeedback = document.querySelectorAll(".select-feedback");
    const selectedStudents = Array.from(selectFeedback)
        .filter(item => item.checked)
        .map(item => {
            const row = item.closest('tr');
            return {
                id: item.dataset.id,
                name: row.querySelector('td:nth-child(4)').textContent,
                phone: row.querySelector('td:nth-child(5)').textContent
            };
        });

    // Show dialog review with bulk feedback mode
    dialogReview.style.display = "block";
    dialogReview.querySelector('.headerBulkFeed').classList.remove('d-none');
    dialogReview.querySelector('.header').classList.add('d-none');

    // Render selected students list
    const listStudentsEl = dialogReview.querySelector('.list-students');
    listStudentsEl.innerHTML = selectedStudents.map(student => `
        <div class="item row align-items-center">
            <p class="col-7">${student.name}</p>
            <button class="btn btn-outline-warning red col-3" data-id="${student.id}"> 
                <i class="fa-solid fa-trash"></i>
                Xoá
            </button>
        </div>
    `).join('');

    // Reset form
    tinymce.get("EvaluateContent").setContent('');
    document.querySelectorAll('input[name="programming-skill"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="thinking-skill"]').forEach(radio => radio.checked = false);

    // Reset language scores
    Ts1.forEach(item => {
        const select = item.querySelector('select');
        const input = item.querySelector('input');
        if (select) select.value = "";
        if (input) input.value = "";
    });

    // Store selected students IDs for submission
    dialogReview.dataset.selectedStudents = JSON.stringify(selectedStudents.map(s => s.id));
}

async function handleBulkFeedbackSubmit() {
    const selectedStudentIds = JSON.parse(dialogReview.dataset.selectedStudents || '[]');
    if (selectedStudentIds.length === 0) {
        alert('Không có học sinh nào được chọn!');
        return;
    }
    // Get form data
    const content = tinymce.get("EvaluateContent").getContent();
    const skill = document.querySelector('input[name="programming-skill"]:checked')?.value;
    const thinking = document.querySelector('input[name="thinking-skill"]:checked')?.value;
    if (!skill || !thinking) {
        alert("Không được để trống các Kĩ Năng");
        return;
    }
    // Get subject scores
    const subjectScores = [];
    Ts1.forEach(item => {
        const level = item.querySelector("select")?.value;
        const score = +item.querySelector("input")?.value;
        if (level && score) {
            subjectScores.push({
                languageIt: item.dataset.id,
                level,
                score
            });
        }
    });

    const object = {
        idTeacher: idTeacher.dataset.id,
        subjectScores,
        content,
        skill,
        thinking
    };
    const payload = await selectedStudentIds.map(id => ({ ...object, idStudent: id }));
    try {
        const data = await createFeedBackBulk(payload);
        console.log(data);
        dialogReview.style.display = "none";
        // Reset UI
        selectAllCheckBox.checked = false;
        document.querySelectorAll('.select-feedback').forEach(cb => cb.checked = false);
        createBulkFeedBack.disabled = true;
    } catch (error) {
        alert('Có lỗi xảy ra khi lưu đánh giá!');
        console.error(error);
    }
}





const renderItemStudent = (content, data = []) => {
    console.log(data);
    if (data && data.length > 0) {
        const fragment = document.createDocumentFragment();
        data.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.classList.add("item");
            tr.innerHTML = `
            <td><input type="checkbox" class="select-feedback" data-id=${item?._id} /></td>
          <td><strong>${index + 1}</strong></td>
          <td>${item?._id}</td>
          <td>${item?.fullname}</td>
          <td>${item?.phone}</td>
          <td>
            <button 
              class="Evaluate1" 
              data-teacher="${item.phone}"  
              data-phone="${item.phone}" 
              data-name="${item.fullname}" 
              data-id="${item._id}">
              <i class="fa-solid fa-street-view"></i>
              Đánh giá
            </button>
            <button 
              class="Trash1"  
              data-phone="${item.phone}" 
              data-name="${item.fullname}" 
              data-id="${item._id}">
              <i class="fa-solid fa-trash"></i>
              Xoá
            </button>
          </td>
      `;
            fragment.appendChild(tr);
        });

        content.innerHTML = "";
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
    contentClass.innerHTML = "";
    contentClass.innerHTML = `
    <div style="position: absolute;" class="d-flex mx-2 col-12 justify-content-center">
      <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
};

/*************************************************
 *  Các hàm tiện ích
 *************************************************/
async function fetchAndRenderClasses(teacherId, contentClass) {
    let listData;
    if (teacherId === "all") {
        const response = await fetch(`${LOCALHOST_API_URL}class`);
        listData = await response.json();
    } else {
        const data = await getClassByTeacherI(teacherId);
        listData = await data.json();
    }
    const render = listData?.data?.data;
    await renderItem(contentClass, render);
}

/*************************************************
 *  Biến toàn cục (nếu cần)
 *************************************************/
// Dùng để lưu các element DOM
let contentClass, showAllStudents, contentTableShowAllStudents;
let nameClassD, dialogReview, containerTeacher, Ts1;
let phoneStudents, nameStudents, idTeacher, createEvaluate;
let monthNow, payload123;
let dialogEditClass, saveClass;
let nameClass, teacher, teacher1, study1, daysContainer1;
let addDayButton1, IdStudentsAdd, addStudents;
let selectTeacher, selectFile, importFile;
let selectAllCheckBox, createBulkFeedBack;
let listStudents, headerBulkFeed;
selectAllCheckBox = getEL("selectAll");
createBulkFeedBack = getEL("btnFeedBackBulk");
/*************************************************
 *  Hàm xử lý click cho popup showAllStudents
 *************************************************/
async function handleShowAllStudentsClick(e) {
    const target = e.target;

    /*****************************************
     * 1. Copy ID khi click vào tr (nếu không phải Evaluate1, Trash1)
     *****************************************/
    if (!target.classList.contains("Evaluate1") && !target.classList.contains("Trash1")) {
        const row = target.closest("tr");
        if (row) {
            const idCell = row.children[2];
            if (idCell) {
                const id = idCell.textContent;
                try {
                    await navigator.clipboard.writeText(id);
                    // Hoặc hiển thị toast tùy ý
                    const notification = document.createElement("div");
                    notification.textContent = "Đã sao chép ID!";
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
                    const style = document.createElement("style");
                    style.textContent = `
            @keyframes fadeOut {
              0% { opacity: 1; }
              70% { opacity: 1; }
              100% { opacity: 0; }
            }
          `;
                    document.head.appendChild(style);
                    document.body.appendChild(notification);

                    setTimeout(() => {
                        notification.remove();
                        style.remove();
                    }, 2000);
                } catch (err) {
                    alert("Không thể sao chép ID!");
                }
            }
        }
    }

    if (target.classList.contains("select-feedback")) {
        onCheckBox();
    }

    /*****************************************
     * 2. Xử lý Evaluate1 (mở dialog đánh giá)
     *****************************************/
    if (target.classList.contains("Evaluate1")) {
        console.log('Evaluate1');
        dialogReview.querySelector('.header').classList.remove('d-none');
        document.querySelector('.headerBulkFeed').classList.add('d-none');
        const studentId = target.dataset.id;
        const studentName = target.dataset.name;
        const phone = target.dataset.phone;

        try {
            const foundFeedBack = await getFeedBackByIdForMonth(studentId, monthNow);
            const dataV = foundFeedBack && foundFeedBack[0] ? foundFeedBack[0] : {};
            const content = dataV?.contentFeedBack || "";

            // setContent cho TinyMCE
            tinymce.get("EvaluateContent").setContent(content);

            // Hiển thị thông tin học sinh
            nameStudents.innerText = studentName || "";
            phoneStudents.innerHTML = `<span>SĐT Phụ Huynh: </span>${phone || ""}`;

            // Reset dữ liệu cũ
            resetAllScoresAndSkills(dataV);

            // Hiển thị dialog review
            dialogReview.style.display = "block";

            // payload cho createFeedBack
            payload123 = {
                idTeacher: idTeacher.dataset.id,
                idStudent: studentId,
            };
        } catch (error) {
            alert("Có lỗi xảy ra khi tải dữ liệu đánh giá. Vui lòng thử lại sau!");
        }
    }

    /*****************************************
     * 3. Xử lý Trash1 (xóa student khỏi lớp)
     *****************************************/
    if (target.classList.contains("Trash1")) {
        const idStudents = target.dataset.id;
        // Lấy classId hiện tại (sẽ lưu khi user click vào itemClass)
        const classId = addStudents?.dataset?.id || null;
        if (!classId) return;

        try {
            const response = await removeStudents(classId, idStudents);
            const data = await response.json();
            if (data) {
                alert("Xoá sinh viên thành công!");
                location.reload();
            }
        } catch (error) {
            alert("Xoá sinh viên thất bại!");
        }
    }

    /*****************************************
     * 4. Xử lý thêm student .addStudentsv
     *****************************************/
    if (target.classList.contains("addStudentsv")) {
        e.preventDefault();
        const classId = addStudents?.dataset?.id || null;
        if (!classId) return;

        if (IdStudentsAdd.value.trim() === "") {
            alert("Không được để trống id sinh viên");
            return;
        }
        try {
            const data = await addStudentsV1(classId, IdStudentsAdd.value);
            const response = await data.json();
            if (response) {
                alert("Thêm sinh viên thành công");
                location.reload();
            }
        } catch (error) {
            alert("Đã có lỗi xảy ra với sinh viên");
        }
    }
}

/*************************************************
 *  Hàm reset điểm, level, radio trong đánh giá
 *************************************************/
function resetAllScoresAndSkills(dataV) {
    // Xoá nội dung cũ
    const Ts1Array = Array.from(Ts1);
    Ts1Array.forEach((item) => {
        const selectElement = item.querySelector("select");
        if (selectElement) {
            selectElement.value = "";
        }
        const inputElement = item.querySelector("input");
        if (inputElement) {
            inputElement.value = "";
        }
    });

    // Cập nhật điểm số môn học
    if (dataV?.subjectScores?.length > 0) {
        dataV.subjectScores.forEach((LG) => {
            const matchedElement = Ts1Array.find(
                (item) => item.dataset.id === LG.languageIt._id
            );
            if (matchedElement) {
                const selectElement = matchedElement.querySelector("select");
                if (selectElement) {
                    selectElement.value = LG.level;
                }
                const inputElement = matchedElement.querySelector("input");
                if (inputElement) {
                    inputElement.value = LG.score;
                }
            }
        });
    }

    // Xoá trạng thái radio
    document
        .querySelectorAll('input[name="programming-skill"]')
        .forEach((radio) => {
            radio.checked = false;
        });
    document.querySelectorAll('input[name="thinking-skill"]').forEach((radio) => {
        radio.checked = false;
    });

    // Cập nhật giá trị radio nếu có
    if (dataV?.skill) {
        document
            .querySelectorAll('input[name="programming-skill"]')
            .forEach((radio) => {
                if (radio.value === dataV.skill) {
                    radio.checked = true;
                }
            });
    }
    if (dataV?.thinking) {
        document
            .querySelectorAll('input[name="thinking-skill"]')
            .forEach((radio) => {
                if (radio.value === dataV.thinking) {
                    radio.checked = true;
                }
            });
    }
}

/*************************************************
 *  Hàm xử lý click cho popup dialogReview (createEvaluate)
 *************************************************/
async function handleDialogReviewClick(e) {
    if (!e.target.classList.contains("createEvaluate")) return;

    // Chuẩn bị data đánh giá
    const subjectScores = [];
    const content = tinymce.get("EvaluateContent").getContent();
    const skill = getCL('input[name="programming-skill"]:checked')?.value;
    const thinking = getCL('input[name="thinking-skill"]:checked')?.value;

    if (!skill || !thinking) {
        return alert("Không được để trống các Kĩ Năng");
    }

    Ts1.forEach((item) => {
        let level = item.querySelector("select")?.value;
        let score = +item.querySelector("input")?.value;
        if (level && score) {
            subjectScores.push({
                languageIt: item.dataset.id,
                level,
                score,
            });
        }
    });

    await createFeedBack({
        ...payload123,
        subjectScores,
        content,
        skill,
        thinking,
    });

    dialogReview.style.display = "none";
}

/*************************************************
 *  Hàm xử lý click ở contentClass (danh sách lớp)
 *************************************************/
async function handleContentClassClick(e) {
    const target = e.target;

    // 1. Khi click vào .itemClass => Mở popup showAllStudents
    if (target.classList.contains("itemClass")) {
        // Nếu bấm trúng nút con bên trong (editClass, delClass) thì bỏ qua
        if (target.className.includes("btnClass") || target.className === "") return;

        const id = target.dataset.id;
        addStudents.dataset.id = id;
        showAllStudents.classList.add("show");

        // Loading + fetch data
        loading(contentTableShowAllStudents);
        const data = await getAllStudentInClass(id);
        const listData = await data.json();
        nameClassD.innerText = listData?.data?.data.nameClass;
        const render = listData?.data?.data?.studentsAccount;
        renderItemStudent(contentTableShowAllStudents, render);
        return;
    }

    // 2. delClass => Xoá lớp
    if (target.classList.contains("delClass")) {
        const classId = target.dataset.id;
        await deleteClass(classId);
        return;
    }

    // 3. editClass => Sửa thông tin lớp
    if (target.classList.contains("editClass")) {
        const classId = target.dataset.id;
        const data = await getClassID(classId);
        const listData = await data.json();
        const render = listData?.data?.data;

        daysContainer1.innerHTML = "";

        // Thêm các day fields
        if (render.days?.length > 0) {
            render.days.forEach(() => {
                addDayField();
            });
        }
        const indays = document.querySelectorAll("#daysContainer1 .days");
        nameClass.value = render.nameClass;
        teacher.value = render.teacherAccount[0]?._id || "";
        if (render.teacherAccount[1]) {
            teacher1.value = render.teacherAccount[1]._id;
            teacher1.style.display = "";
        } else {
            teacher1.style.display = "none";
        }
        study1.value = render.study;
        saveClass.dataset.id = render._id;
        indays.forEach((day, index) => {
            day.value = render.days[index];
        });

        dialogEditClass.classList.add("show");
        return;
    }
}

/*************************************************
 *  Tạo, xóa day field + các hàm liên quan đến .editClass
 *************************************************/
function addDayField() {
    const days = document.querySelectorAll(".days");
    if (days.length >= 7) {
        addDayButton1.style.display = "none";
        return createToast("error");
    }
    const dayEntry = document.createElement("div");
    dayEntry.className = "input-group mb-2 day-entry";
    dayEntry.innerHTML = `
    <select class="form-select days" name="days" required>
      <option disabled>Ngày học học sinh trong tuần</option>
      <option value="2">Thứ 2</option>
      <option value="3">Thứ 3</option>
      <option value="4">Thứ 4</option>
      <option value="5">Thứ 5</option>
      <option value="6">Thứ 6</option>
      <option value="7">Thứ 7</option>
      <option value="8">Chủ nhật</option>
    </select>
    <button type="button" class="btn btn-danger remove-day">
      <i class="fa-solid fa-trash"></i>
    </button>
    <div class="invalid-feedback">Vui lòng chọn ngày học.</div>
  `;
    daysContainer1.appendChild(dayEntry);

    // Nút remove
    dayEntry.querySelector(".remove-day").addEventListener("click", () => {
        daysContainer1.removeChild(dayEntry);
    });
}

// (Nếu bạn có hàm createSelect dành cho teacher, bạn cũng tổ chức tương tự.)

/*************************************************
 *  Lưu khi ấn "saveClass" (chỉnh sửa class)
 *************************************************/
async function handleSaveClass(e) {
    e.preventDefault();
    const id = e.target.dataset.id;

    const indays = document.querySelectorAll("#daysContainer1 .days");
    const days = Array.from(indays).map((item) => +item.value);

    // Lấy danh sách teacher - (nếu bạn có multi teacher)
    // Ở code gốc bạn dùng .selectTeacher? Tùy bạn cấu hình.
    // Giả sử containerTeacher chứa list .selectTeacher:
    const inTechers = containerTeacher.querySelectorAll(".selectTeacher");
    const teachers = Array.from(inTechers)
        .filter((item) => item.style.display !== "none")
        .map((item) => item.value);

    const body = {
        nameClass: nameClass.value,
        teacherAccount: teachers,
        study: +study1.value,
        days: days,
    };

    try {
        const data = await editClassV(id, body);
        const listData = await data.json();
        const render = listData?.data?.data;
        if (render) {
            alert("Chỉnh sửa thành công");
            location.reload();
        } else {
            alert("Không thành công!");
        }
    } catch (error) {
        alert("Có vẻ tên đã tồn tại");
    }
}

async function selectAllCheckBoxV() {
    const selectFeedback = document.querySelectorAll(".select-feedback");
    selectFeedback.forEach((item) => {
        item.checked = selectAllCheckBox.checked;
    });
    createBulkFeedBack.disabled = !selectAllCheckBox.checked;
}

async function onCheckBox() {
    const selectFeedback = document.querySelectorAll(".select-feedback");
    const selected = Array.from(selectFeedback).filter((item) => item.checked);
    if (selected.length > 1) {
        createBulkFeedBack.disabled = false;
    } else {
        createBulkFeedBack.disabled = true;
    }
}

async function createBulkFeedBackDB() {
    const selectFeedback = document.querySelectorAll(".select-feedback");
    const selected = Array.from(selectFeedback).filter((item) => item.checked);
    const selectedId = selected.map((item) => item.dataset.id);
    const body = {
        idTeacher: idTeacher.dataset.id,
        idStudents: selectedId,
    };
    // show ra popup và xác nhận


    // await createFeedBackBulk(body);
    // location.reload();
}
/*************************************************
 *  DOMContentLoaded - nơi gắn event 1 lần
 *************************************************/
document.addEventListener("DOMContentLoaded", async () => {
    /*****************************************
     * 1. Khởi tạo TinyMCE
     *****************************************/
    tinymce.init({
        selector: "#EvaluateContent",
    });

    /*****************************************
     * 2. Truy xuất các phần tử DOM
     *****************************************/
    monthNow = new Date().getMonth() + 1;

    contentClass = getEL("contentClass");
    selectTeacher = getCL(".teacher");
    showAllStudents = getEL("showAllStudents");
    contentTableShowAllStudents = getEL("contentTable");
    IdStudentsAdd = getEL("IdStudentsAdd");
    addStudents = getEL("addStudents");
    nameClassD = getEL("nameClassD");
    dialogReview = getCL(".dialogReview");
    containerTeacher = getEL("containerTeacher");
    Ts1 = document.querySelectorAll(".language");
    nameStudents = dialogReview.querySelector(".nameStudents");
    phoneStudents = dialogReview.querySelector(".phoneStudents");
    createEvaluate = dialogReview.querySelector(".createEvaluate");
    selectFile = getEL("fileInput");
    importFile = getEL("importButton");
    idTeacher = getEL("teacher");
    let selectFeedback = document.querySelectorAll(".select-feedback");

    // Dialog EditClass
    dialogEditClass = getEL("dialogEditClass");
    saveClass = getEL("saveClass");
    nameClass = getEL("nameClass");
    teacher = getEL("pemission");
    teacher1 = getEL("pemission1");
    study1 = getEL("study1");
    daysContainer1 = getEL("daysContainer1");
    addDayButton1 = getEL("addDayButton1");




    /*****************************************
     * 3. Gắn event listener *một lần*
     *****************************************/
    // select file 
    if (importFile) {
        importFile.addEventListener("click", async () => {
            console.log(selectFile.files[0]);
            const formData = new FormData();
            if (!selectFile.files[0]) {
                return alert("Vui lòng chọn file");
            }
            formData.append("excel", selectFile.files[0]);
            const data = await createFileFeedBack(formData);
            console.log(data);
        });
    }

    // import button 
    selectAllCheckBox.addEventListener("click", selectAllCheckBoxV);
    // a) Đóng dialogReview
    dialogReview.querySelector(".xmark").addEventListener("click", () => {
        dialogReview.style.display = "none";
    });

    createBulkFeedBack.addEventListener("click", showBulkFeedbackDialog);


    // b) Đóng popup showAllStudents
    showAllStudents.querySelector(".xmark").addEventListener("click", () => {
        showAllStudents.classList.remove("show");
        dialogReview.style.display = "none";
    });

    // c) Đóng dialogEditClass
    dialogEditClass.querySelector(".xmark").addEventListener("click", () => {
        dialogEditClass.classList.remove("show");
    });

    // d) contentClass - danh sách lớp
    contentClass.addEventListener("click", handleContentClassClick);

    // e) showAllStudents - popup danh sách học sinh trong lớp
    showAllStudents.addEventListener("click", handleShowAllStudentsClick);

    // f) dialogReview - popup đánh giá
    // dialogReview.addEventListener("click", handleDialogReviewClick);
    createEvaluate.addEventListener("click", async () => {
        if (dialogReview.querySelector('.headerBulkFeed').classList.contains('d-none')) {
            // Single feedback
            await handleDialogReviewClick({ target: createEvaluate });
        } else {
            // Bulk feedback
            console.log("Đã vào  ======");
            await handleBulkFeedbackSubmit();
        }
    });


    dialogReview.querySelector('.list-students').addEventListener('click', e => {
        if (e.target.classList.contains('red')) {
            const studentId = e.target.dataset.id;
            const selectedStudents = JSON.parse(dialogReview.dataset.selectedStudents || '[]');
            dialogReview.dataset.selectedStudents = JSON.stringify(
                selectedStudents.filter(id => id !== studentId)
            );
            e.target.closest('.item').remove();

            // Close dialog if no students left
            if (selectedStudents.length <= 1) {
                dialogReview.style.display = "none";
                selectAllCheckBox.checked = false;
                document.querySelectorAll('.select-feedback').forEach(cb => cb.checked = false);
                createBulkFeedBack.disabled = true;
            }
        }
    });
    // g) Lưu editClass
    saveClass.addEventListener("click", handleSaveClass);

    // h) Thêm ngày học
    addDayButton1.addEventListener("click", addDayField);

    /*****************************************
     * 4. Lần đầu load danh sách lớp
     *****************************************/
    loading(contentClass);
    if (selectTeacher.value === "all") {
        const response = await fetch(`${LOCALHOST_API_URL}class`);
        const listData = await response.json();
        const render = listData?.data?.data;
        await renderItem(contentClass, render);
    } else {
        fetchAndRenderClasses(selectTeacher.value, contentClass);
    }

    // i) Khi chọn teacher khác
    selectTeacher.addEventListener("change", async (e) => {
        if (e.target.value === "all") {
            location.reload();
        } else {
            loading(contentClass);
            fetchAndRenderClasses(e.target.value, contentClass);
        }
    });
});
