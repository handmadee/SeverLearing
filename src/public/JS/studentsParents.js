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

const renderItemStudent = (content, name, data = []) => {
    if (data && data.length > 0) {
        const fragment = document.createDocumentFragment();
        data.forEach((item) => {
            const divItemFeedback = document.createElement('div');
            divItemFeedback.classList.add('itemFeedBack');
            divItemFeedback.innerHTML = `
                <div class="bgrFeedBack">
                    <div class="contentFeedback">
                        <p><strong>Kính gửi Phụ Huynh: </strong>${name}</p>
                        <p class="content">
                            ${item.contentFeedBack}
                        </p>
                        <div class="dateFeedback">
                            <strong>Ngày đánh giá</strong>
                            <p class="dateFeed">${formatDate(item.createdAt)}</p>
                              <p>TSMART</p>
                        </div>
                    </div>
                      <div class="footerIcons row">
                <p class="itemIcon">
                  <a href="tel:0868552445 ">
                    <i class="fa-solid fa-phone"></i>
                    <span> 0868 552 445 </span>
                  </a>
                </p>
                <p class="itemIcon">
                  <a href="https://linktr.ee/tsmart_edu">
                    <i class="fa-solid fa-globe"></i>
                    <span>linktr.ee/tsmart_edu</span>
                  </a>
                </p>
                <p class="itemIcon">
                  <a href="https://linktr.ee/tsmart_edu">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>34 Lương Khánh Thiện - Liên Chiểu - TP Đà Nẵng</span>
                  </a>
                </p>
              </div>
                </div>
            `;

            fragment.appendChild(divItemFeedback);
        });

        content.innerHTML = ''; // Xóa nội dung cũ
        content.appendChild(fragment); // Thêm nội dung mới
    } else {
        content.innerHTML = `
            <div class="noFeedback" style="text-align: center;">
                Chưa có đánh giá từ giáo viên
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const idStudents = document.getElementById('IdStudent');
    const time = document.getElementById('time');
    const contentTable = document.getElementById('contentTable');
    let name = contentTable.dataset.name;
    const id = idStudents.dataset.id;
    const Month = new Date().getMonth() + 1;
    // 
    time.value = Month;
    loading(contentTable);
    const data = await getFeedBackByIdForMonth(id, Month);
    renderItemStudent(contentTable, name, data)
    // Change 
    time.addEventListener('change', async (event) => {
        console.log(event.target.value)
        let data = [];
        if (event.target.value == 'all') {
            loading(contentTable);
            data = await getAllFeedBack(id);
            console.log(data)
            renderItemStudent(contentTable, name, data)
        } else {
            data = await getFeedBackByIdForMonth(id, event.target.value);
        }
        loading(contentTable);
        renderItemStudent(contentTable, name, data)
    })

})