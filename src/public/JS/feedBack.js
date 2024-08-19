import { LOCALHOST_API_URL } from "./config.js";

// DOM Elements
const selectTeacher = document.querySelector(".teacher");
const main = document.querySelector(".main");
const selectTime = document.getElementById("time");
const contentTable = document.getElementById("contentTable");
const EvaluateContent = document.getElementById("EvaluateContent");
const items = contentTable.querySelectorAll(".item");
const dialogReview = document.querySelector(".dialogReview");
const nameStu = dialogReview.querySelector(".nameStudents");
const xmark = dialogReview.querySelector(".xmark");
const btnEdit = dialogReview.querySelector(".editFeedBack");
// Close the dialog
xmark.addEventListener('click', () => {
    dialogReview.style.display = "none";
    btnEdit.removeEventListener('click', handleEditClick);
});

// Helper function to format the date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// API Call Functions
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

const getFeedbackByTeacherAndMonth = (id, month) =>
    fetchFeedbackData(`${LOCALHOST_API_URL}feedback/teacher/${id}?month=${month}`);

const getFeedbackByTeacher = (id) =>
    fetchFeedbackData(`${LOCALHOST_API_URL}feedbackByTeacher/${id}`);

const getFeedbackByMonth = (month) =>
    fetchFeedbackData(`${LOCALHOST_API_URL}feedbackByMonth?month=${month}`);

// Render Functions
const renderLoading = () => {
    contentTable.innerHTML = `
        <tr>
            <td colspan="5" class="py-5">
                <div class="d-flex mx-2 col-12 justify-content-center">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </td>
        </tr>`;
};

const renderEmptyRow = () => `
    <tr>
        <td colspan="5" class="text-center">Không có đánh giá nào tại thời điểm hiện tại</td>
    </tr>`;

const renderItems = (data = []) => {
    if (data.length === 0) {
        contentTable.innerHTML = renderEmptyRow();
        return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach((item) => {
        const tr = document.createElement('tr');
        tr.classList.add('item');
        tr.innerHTML = `
        <td>${item?.studentsAccount?.fullname}</td>
            <td>${item?.teacherAccount?.username}</td>
            <td id="contentV">${item?.contentFeedBack}</td>
            <td>${formatDate(item?.createdAt)}</td>
            <td class="column">
                <button  class="edit"  data-name="${item?.studentsAccount?.fullname}" data-id="${item._id}">
                    <i class="review fa-solid fa-street-view"></i> Chỉnh sửa
                </button>
                <button class="delete"  data-id="${item._id}">
                    <i class="trash fa-solid fa-trash"></i> Xoá
                </button>
            </td>`;
        fragment.appendChild(tr);
    });

    contentTable.innerHTML = ''; // Clear previous content
    contentTable.appendChild(fragment);
};

// Main Render Function
const renderFeedback = async () => {
    renderLoading();
    let data = [];
    const teacherId = selectTeacher.value;
    const month = selectTime.value;
    if (teacherId === 'all' && month === 'all') {
        data = await getFeedbackByMonth(new Date().getMonth() + 1);
    } else if (teacherId === 'all') {
        data = await getFeedbackByMonth(month);
    } else if (month === 'all') {
        data = await getFeedbackByTeacher(teacherId);
    } else {
        data = await getFeedbackByTeacherAndMonth(teacherId, month);
    }
    renderItems(data);
};

const removeFeedBack = async (id) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/${id}`, {
            method: "DELETE"
        });
        if (response) {
            alert("xoá đánh giá thành công");
            location.reload();
        }
    } catch (error) {
        console.error(error);
        alert("Đã xảy ra lỗi không mong muốn");
    }
}

const editFeedBack = async (id, body) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/${id}`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: body
            })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        alert("sửa đổi thành công");
        location.reload();
    } catch (error) {
        console.error(error);
        alert("Đã xảy ra lỗi không mong muốn");
    }
}

// Event Handlers
const handlerEditFeedBack = async (id) => {
    const value = tinymce.get('EvaluateContent').getContent();;
    console.log(value);
    return await editFeedBack(id, value);
};



// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    tinymce.init({
        selector: '#EvaluateContent'
    });
    selectTime.value = new Date().getMonth() + 1;
    await renderFeedback();
    selectTeacher.addEventListener("change", renderFeedback);
    selectTime.addEventListener("change", renderFeedback);
    let id = null;

    contentTable.addEventListener('click', async (e) => {
        if (e.target.classList.contains("edit")) {
            const contentV = document.getElementById("contentV");
            tinymce.get('EvaluateContent').setContent(contentV.innerHTML);
            id = e.target.dataset.id;
            const name = e.target.dataset.name;
            dialogReview.style.display = "block";
            nameStu.textContent = name;
        } else if (e.target.classList.contains("delete")) {
            await removeFeedBack(e.target.dataset.id);
        }
    });
    btnEdit.addEventListener('click', () => handlerEditFeedBack(id), { once: true });
});
