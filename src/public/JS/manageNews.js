'use strict';
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;
document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");
    const editCoursePopup = document.getElementById('editModal');
    const cancelPopup = document.getElementById('cancelPopup');
    const cancelPopup2 = document.getElementById('cancelPopup2');
    const savePopup = document.getElementById('savePopup');

    let currentIdNews = null;

    cancelPopup.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });

    cancelPopup2.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });

    editButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const newid = e.target.dataset?.newid;
            const imagePost = e.target.dataset?.image;
            const contentNews = e.target.dataset?.content;
            currentIdNews = newid;
            renderNews(newid, imagePost, contentNews);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            if (!id) return createToast('error');
            delExam(id);
        });
    });

    const delExam = async (id) => {
        try {

            const exam = await fetch(`${localhost}/news/${id}`, {
                method: 'DELETE',
            });


            if (!exam.ok) {
                return createToast('error');
            }

            alert('Xoá bài viết thành công');
            location.reload();
        } catch (error) {
            console.log(error);
            createToast('error');
        }
    }

    const handlerEditNews = async function () {
        const imagePost = document.getElementById('imagePost');
        const contentNews = document.getElementById('contentNews');
        const formData = new FormData();
        formData.append('contentNews', contentNews.value);
        if (imagePost.files.length > 0) {
            formData.append('imagePost', imagePost.files[0]);
        }

        savePopup.disabled = true; // Disable button để ngăn người dùng bấm lại trong khi đang xử lý
        savePopup.querySelector('.spinner-border').classList.remove('d-none'); // Hiển thị spinner

        try {

            const response = await updateCourse(formData, currentIdNews);

            if (response.ok) {
                alert('Cập nhật bài viết thành công');
                location.reload();
            } else {
                createToast('error');
            }
        } catch (error) {
            console.error('Error:', error);
            createToast('error');
        } finally {
            savePopup.disabled = false; // Enable lại button sau khi hoàn thành
            savePopup.querySelector('.spinner-border').classList.add('d-none'); // Ẩn spinner
        }
    };

    const renderNews = async (id, image, content) => {
        const contentNews = document.getElementById('contentNews');
        contentNews.value = content;
        editCoursePopup.classList.add('show');
        savePopup.removeEventListener('click', handlerEditNews);
        savePopup.addEventListener('click', handlerEditNews);
    }

    const updateCourse = async (data, courseid) => {
        try {
            const response = await fetch(`${localhost}/news/${courseid}`, {
                method: 'PUT',
                body: data
            });

            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
});
