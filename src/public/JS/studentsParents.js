import { LOCALHOST_API_URL } from "./config.js";


const getFeedBackByIdForMonth = async (id, month) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedback/students/${id}?month=${month}`);
        const data = await response.json();
        return data.data.data;
    } catch (error) {
        alert("Đã xảy ra lỗi get FeedBack !")
    }
}

const getAllFeedBack = async (id) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}feedbackStudents/${id}`);
        const data = await response.json();
        return data.data.data;
    } catch (error) {
        alert("Đã xảy ra lỗi get FeedBack !")
    }
}

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
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

const renderItemStudent = (content, data = []) => {
    if (data && data.length > 0) {

        // Create a DocumentFragment to accumulate HTML elements
        const fragment = document.createDocumentFragment();
        // Iterate over each item in the data array
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            // tr.classList.add('item');
            // Set the inner HTML of the table row
            tr.innerHTML = `
                  <td>${item.studentsAccount.fullname}</td>
                  <td>${item.contentFeedBack}</td>
                  <td>${formatDate(item.createdAt)}</td>
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
                    Chưa có đánh giá từ giáo viên
                </td>
            </tr>
        `;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const idStudents = document.getElementById('IdStudent');
    const time = document.getElementById('time');
    const contentTable = document.getElementById('contentTable');
    const id = idStudents.dataset.id;
    const Month = new Date().getMonth() + 1;
    // 
    time.value = Month;
    loading(contentTable);
    const data = await getFeedBackByIdForMonth(id, Month);
    renderItemStudent(contentTable, data)
    // Change 
    time.addEventListener('change', async (event) => {
        console.log(event.target.value)
        let data = [];
        if (event.target.value == 'all') {
            loading(contentTable);
            data = await getAllFeedBack(id);
            console.log(data)
            renderItemStudent(contentTable, data)
        } else {
            data = await getFeedBackByIdForMonth(id, event.target.value);
        }
        loading(contentTable);
        renderItemStudent(contentTable, data)
    })








})