import { LOCALHOST_API_URL } from "./config.js";


const searchStudents = async (id) => {
    return await fetch(`${LOCALHOST_API_URL}feedback/${id}`);
}


document.addEventListener("DOMContentLoaded", () => {
    const idStudents = document.getElementById("idStudents");
    const searchID = document.getElementById("searchID");
    searchID.addEventListener("click", async (event) => {
        event.preventDefault();
        const value = idStudents.value.trim();
        if (value == "" || value.length < 12) return alert("Vui lòng điền ID học sinh !");
        try {
            const pemission = await searchStudents(value);
            const data = await pemission.json();
            if (data) {
                const baseUrl = window.location.href.endsWith('/') ? window.location.href.slice(0, -1) : window.location.href;
                return window.location.href = baseUrl + "/students/" + value;
            } else {
                alert("Học sinh chưa có đánh giá nào từ giảng viên !!");
            }
        } catch (error) {
            console.log(error)
            alert("Học sinh chưa có đánh giá nào từ giảng viên !!");
        }
    });
})