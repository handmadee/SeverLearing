// import { LOCALHOST_API_URL } from "./config.js";

// // DOM Elements
// const selectTeacher = document.querySelector(".teacher");
// const main = document.querySelector(".main");
// const selectTime = document.getElementById("time");
// const contentTable = document.getElementById("contentTable");
// const EvaluateContent = document.getElementById("EvaluateContent");
// const items = contentTable.querySelectorAll(".item");
// const dialogReview = document.querySelector(".dialogReview");
// const nameStu = dialogReview.querySelector(".nameStudents");
// const xmark = dialogReview.querySelector(".xmark");
// const btnEdit = dialogReview.querySelector(".editFeedBack");
// // Close the dialog
// xmark.addEventListener('click', () => {
//     dialogReview.style.display = "none";
//     btnEdit.removeEventListener('click', handleEditClick);
// });

// // Helper function to format the date
// const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
// };

// // API Call Functions
// const fetchFeedbackData = async (endpoint) => {
//     try {
//         const response = await fetch(endpoint);
//         const data = await response.json();
//         return data.data.data;
//     } catch (error) {
//         console.error(error);
//         alert("Đã xảy ra lỗi không mong muốn");
//         return [];
//     }
// };

// const getFeedbackByTeacherAndMonth = (id, month) =>
//     fetchFeedbackData(`${LOCALHOST_API_URL}feedback/teacher/${id}?month=${month}`);

// const getFeedbackByTeacher = (id) =>
//     fetchFeedbackData(`${LOCALHOST_API_URL}feedbackByTeacher/${id}`);

// const getFeedbackByMonth = (month) =>
//     fetchFeedbackData(`${LOCALHOST_API_URL}feedbackByMonth?month=${month}`);

// // Render Functions
// const renderLoading = () => {
//     contentTable.innerHTML = `
//         <tr>
//             <td colspan="5" class="py-5">
//                 <div class="d-flex mx-2 col-12 justify-content-center">
//                     <div class="spinner-border text-success" role="status">
//                         <span class="visually-hidden">Loading...</span>
//                     </div>
//                 </div>
//             </td>
//         </tr>`;
// };

// const renderEmptyRow = () => `
//     <tr>
//         <td colspan="5" class="text-center">Không có đánh giá nào tại thời điểm hiện tại</td>
//     </tr>`;

// const renderItems = (data = []) => {
//     if (data.length === 0) {
//         contentTable.innerHTML = renderEmptyRow();
//         return;
//     }

//     const fragment = document.createDocumentFragment();
//     data.forEach((item) => {
//         const tr = document.createElement('tr');
//         tr.classList.add('item');
//         tr.innerHTML = `
//         <td>${item?.studentsAccount?.fullname}</td>
//             <td>${item?.teacherAccount?.username}</td>
//             <td id="contentV">${item?.contentFeedBack}</td>
//             <td>${formatDate(item?.createdAt)}</td>
//             <td class="column">
//                 <button  class="edit"  data-name="${item?.studentsAccount?.fullname}" data-id="${item._id}">
//                     <i class="review fa-solid fa-street-view"></i> Chỉnh sửa
//                 </button>
//                 <button class="delete"  data-id="${item._id}">
//                     <i class="trash fa-solid fa-trash"></i> Xoá
//                 </button>
//             </td>`;
//         fragment.appendChild(tr);
//     });

//     contentTable.innerHTML = ''; // Clear previous content
//     contentTable.appendChild(fragment);
// };

// // Main Render Function
// const renderFeedback = async () => {
//     renderLoading();
//     let data = [];
//     const teacherId = selectTeacher.value;
//     const month = selectTime.value;
//     if (teacherId === 'all' && month === 'all') {
//         data = await getFeedbackByMonth(new Date().getMonth() + 1);
//     } else if (teacherId === 'all') {
//         data = await getFeedbackByMonth(month);
//     } else if (month === 'all') {
//         data = await getFeedbackByTeacher(teacherId);
//     } else {
//         data = await getFeedbackByTeacherAndMonth(teacherId, month);
//     }

//     console.log(data);
//     renderItems(data);
// };

// const removeFeedBack = async (id) => {
//     try {
//         const response = await fetch(`${LOCALHOST_API_URL}feedback/${id}`, {
//             method: "DELETE"
//         });
//         if (response) {
//             alert("xoá đánh giá thành công");
//             location.reload();
//         }
//     } catch (error) {
//         console.error(error);
//         alert("Đã xảy ra lỗi không mong muốn");
//     }
// }

// const editFeedBack = async (id, body) => {
//     try {
//         const response = await fetch(`${LOCALHOST_API_URL}feedback/${id}`, {
//             method: "PATCH",
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 content: body
//             })
//         });
//         if (!response.ok) throw new Error('Network response was not ok');
//         alert("sửa đổi thành công");
//         location.reload();
//     } catch (error) {
//         console.error(error);
//         alert("Đã xảy ra lỗi không mong muốn");
//     }
// }

// // Event Handlers
// const handlerEditFeedBack = async (id) => {
//     const value = tinymce.get('EvaluateContent').getContent();;
//     console.log(value);
//     return await editFeedBack(id, value);
// };



// // Event Listeners
// document.addEventListener('DOMContentLoaded', async () => {
//     tinymce.init({
//         selector: '#EvaluateContent'
//     });
//     selectTime.value = new Date().getMonth() + 1;
//     await renderFeedback();
//     selectTeacher.addEventListener("change", renderFeedback);
//     selectTime.addEventListener("change", renderFeedback);
//     let id = null;

//     contentTable.addEventListener('click', async (e) => {
//         if (e.target.classList.contains("edit")) {
//             const contentV = document.getElementById("contentV");
//             tinymce.get('EvaluateContent').setContent(contentV.innerHTML);
//             id = e.target.dataset.id;
//             const name = e.target.dataset.name;
//             dialogReview.style.display = "block";
//             nameStu.textContent = name;
//         } else if (e.target.classList.contains("delete")) {
//             await removeFeedBack(e.target.dataset.id);
//         }
//     });
//     btnEdit.addEventListener('click', () => handlerEditFeedBack(id), { once: true });
// });


import { LOCALHOST_API_URL } from "./config.js";

// DOM Elements
const selectTeacher = document.getElementById("teacher");
const selectTime = document.getElementById("time");
const contentTable = document.getElementById("contentTable");
const dialogReview = document.getElementById("dialogReview");
const nameStudentsEl = dialogReview.querySelector(".nameStudents");
const phoneStudentsEl = dialogReview.querySelector(".phoneStudents");
const tableLanguages = dialogReview.querySelector("#tableLanguages");
const btnCloseDialog = document.getElementById("btnCloseDialog");
const btnSubmitFeedback = document.getElementById("btnSubmitFeedback");

// Radio skill
const radioProgramming = dialogReview.querySelectorAll('input[name="programming-skill"]');
// Radio thinking
const radioThinking = dialogReview.querySelectorAll('input[name="thinking-skill"]');

let feedbackIdEditing = null;
let currentFeedbackData = null; // Lưu trữ data feedback đang chỉnh sửa

// Đóng dialog
btnCloseDialog.addEventListener('click', () => {
    dialogReview.style.display = "none";
    feedbackIdEditing = null;
    currentFeedbackData = null;
});

// TinyMCE init
document.addEventListener('DOMContentLoaded', async () => {
    tinymce.init({
        selector: '#EvaluateContent'
    });
    // Set mặc định tháng hiện tại
    selectTime.value = new Date().getMonth() + 1;
    // Render lần đầu
    await renderFeedback();
    // Thay đổi filter
    selectTeacher.addEventListener("change", renderFeedback);
    selectTime.addEventListener("change", renderFeedback);
});

// Hàm format ngày
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Fetch data
const fetchFeedbackData = async (endpoint) => {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.data.data;
    } catch (error) {
        console.error(error);
        alert("Đã xảy ra lỗi không mong muốn");
        return [];
    }
};

const getAllFeedback = () => fetchFeedbackData(`${LOCALHOST_API_URL}feedback`);
const getFeedbackByTeacherAndMonth = (id, month) =>
    fetchFeedbackData(`${LOCALHOST_API_URL}feedback/teacher/${id}?month=${month}`);
const getFeedbackByTeacher = (id) =>
    fetchFeedbackData(`${LOCALHOST_API_URL}feedbackByTeacher/${id}`);
const getFeedbackByMonth = (month) =>
    fetchFeedbackData(`${LOCALHOST_API_URL}feedbackByMonth?month=${month}`);

// Render loading
const renderLoading = () => {
    contentTable.innerHTML = `
    <tr>
      <td colspan="7" class="py-5 text-center">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </td>
    </tr>
  `;
};

// Render empty
const renderEmptyRow = () => `
  <tr>
    <td colspan="7" class="text-center py-3">Không có đánh giá nào tại thời điểm hiện tại</td>
  </tr>
`;

// Render danh sách feedback
const renderItems = (feedbackList = []) => {
    if (!feedbackList.length) {
        contentTable.innerHTML = renderEmptyRow();
        return;
    }
    contentTable.innerHTML = feedbackList.map(item => {
        return `
      <tr>
        <td>${item?.studentsAccount?.fullname || '-'}</td>
        <td>${item?.teacherAccount?.username || '-'}</td>
       <td
    class="${item?.skill
                ? (item.skill === 'good'
                    ? 'badge-skill good'
                    : item.skill === 'rather'
                        ? 'badge-skill rather'
                        : item.skill === 'medium'
                            ? 'badge-skill medium'
                            : '')
                : ''}">
    ${item?.skill || '-'}
  </td>
  
  <td
    class="${item?.thinking
                ? (item.thinking === 'good'
                    ? 'badge-skill good'
                    : item.thinking === 'rather'
                        ? 'badge-skill rather'
                        : item.thinking === 'medium'
                            ? 'badge-skill medium'
                            : '')
                : ''}">
    ${item?.thinking || '-'}
  </td>
        <td>${item?.contentFeedBack || '-'}</td>
        <td>${formatDate(item?.createdAt)}</td>
        <td>
          <button class="editBtn" data-id="${item._id}"><i class="review fa-solid fa-street-view"></i> Chỉnh sửa</button>
          <button class="deleteBtn" data-id="${item._id}"><i class="trash fa-solid fa-trash"></i> Xoá</button>
        </td>
      </tr>
    `;
    }).join("");
};

// Render feedback
const renderFeedback = async () => {
    renderLoading();
    let data = [];
    const teacherId = selectTeacher.value;
    const month = selectTime.value;

    // Logic filter
    if (teacherId === 'all' && month === 'all') {
        data = await getAllFeedback();
    } else if (teacherId === 'all') {
        data = await getFeedbackByMonth(month);
    } else if (month === 'all') {
        data = await getFeedbackByTeacher(teacherId);
    } else {
        data = await getFeedbackByTeacherAndMonth(teacherId, month);
    }

    renderItems(data);

    // Thêm sự kiện cho nút edit / delete sau khi render xong
    document.querySelectorAll(".editBtn").forEach(btn => {
        btn.addEventListener("click", () => onEditClick(btn.dataset.id));
    });
    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", () => onDeleteClick(btn.dataset.id));
    });
};

// Lấy data theo id feedback
const getFeedbackById = async (id) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/find-id/${id}`);
        const result = await response.json();
        return result.data.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Xử lý khi click "Chỉnh sửa"
const onEditClick = async (id) => {
    feedbackIdEditing = id;
    console.log("Edit feedback ID:", id);
    const data = await getFeedbackById(id);
    if (!data) {
        alert("Không lấy được dữ liệu feedback!");
        return;
    }
    currentFeedbackData = data;

    // Đổ data vào form
    /**
      data ví dụ:
      {
        "_id": "6767b0091f4c074f8ee58fe2",
        "teacherAccount": { "_id": "66b25a528548d1851317b35f", "username": "admin" },
        "studentsAccount": { "_id": "66936349a1c8c5dd16110d3e", "fullname": "Phan Như Ý 1", "phone":"0377xxxxxx" },
        "contentFeedBack": "<p>toots</p>",
        "createdAt": "2024-12-22T06:22:01.699Z",
        "skill": "rather",
        "subjectScores": [],
        "thinking": "rather"
      }
    */
    console.log(data);
    nameStudentsEl.textContent = data.studentsAccount.fullname || 'N/A';
    phoneStudentsEl.textContent = data.studentsAccount.phone || 'Chưa có số ĐT';

    // Gán skill
    radioProgramming.forEach(radio => {
        radio.checked = (radio.value === data.skill);
    });

    // Gán thinking
    radioThinking.forEach(radio => {
        radio.checked = (radio.value === data.thinking);
    });

    // Gán content feedback vào TinyMCE
    tinymce.get('EvaluateContent').setContent(data.contentFeedBack || '');

    renderSubjectScores(data.subjectScores);

    // Show dialog
    dialogReview.style.display = "block";
};

// Render subjectScores lên table
const renderSubjectScores = (scores = []) => {
    if (!scores.length) {
        tableLanguages.innerHTML = `
      <tr><td colspan="3">Chưa có subjectScores</td></tr>
    `;
        return;
    }

    tableLanguages.innerHTML = scores.map(item => {
        return `
      <tr class="language" data-id="${item.languageIt._id}">
        <td>${item.languageIt.nameCode}</td>
        <td>
          <select>
            <option value="">Chọn</option>
            <option value="1" ${item.level === "1" ? "selected" : ""}>Level 1</option>
            <option value="2" ${item.level === "2" ? "selected" : ""}>Level 2</option>
            <option value="3" ${item.level === "3" ? "selected" : ""}>Level 3</option>
          </select>
        </td>
        <td><input type="number" min="0" value="${item.score || 0}"/></td>
      </tr>
    `;
    }).join("");
};

// Xử lý nút Submit (Cập nhật đánh giá)
btnSubmitFeedback.addEventListener("click", async () => {
    if (!feedbackIdEditing) {
        alert("Chưa có feedback nào để sửa!");
        return;
    }

    // Lấy giá trị textarea từ TinyMCE
    const contentValue = tinymce.get('EvaluateContent').getContent();

    // Lấy skill
    let skillValue = '';
    radioProgramming.forEach(radio => {
        if (radio.checked) skillValue = radio.value;
    });

    // Lấy thinking
    let thinkingValue = '';
    radioThinking.forEach(radio => {
        if (radio.checked) thinkingValue = radio.value;
    });

    // Lấy subjectScores (nếu có)
    const subjectScoresData = [];
    tableLanguages.querySelectorAll("tr.language").forEach(tr => {
        const languageIt = tr.getAttribute("data-id");
        const level = tr.querySelector("select").value;
        const score = tr.querySelector("input[type='number']").value;
        subjectScoresData.push({ languageIt, level, score });
    });

    // Chuẩn bị body PUT/PATCH
    const bodyData = {
        contentFeedBack: contentValue,
        skill: skillValue,
        thinking: thinkingValue,
        subjectScores: subjectScoresData
    };




    // Gọi hàm update
    await updateFeedback(feedbackIdEditing, bodyData);
});

const updateFeedback = async (id, body) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/${id}`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error("Network response was not ok");
        alert("Sửa đổi thành công");
        // Đóng popup, reload
        dialogReview.style.display = "none";
        await renderFeedback();
    } catch (error) {
        console.error(error);
        alert("Đã xảy ra lỗi không mong muốn");
    }
};

// Xoá
const onDeleteClick = async (id) => {
    const confirmDel = confirm("Bạn có chắc muốn xoá đánh giá này?");
    if (!confirmDel) return;

    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/${id}`, {
            method: "DELETE"
        });
        if (response.ok) {
            alert("Xoá đánh giá thành công!");
            await renderFeedback();
        }
    } catch (error) {
        console.error(error);
        alert("Đã xảy ra lỗi không mong muốn");
    }
};
