'use strict';
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;
document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");
    // Control trong popup
    const editCoursePopup = document.getElementById('editModal');
    const cancelPopup = document.getElementById('cancelPopup');
    const cancelPopup2 = document.getElementById('cancelPopup2');
    const savePopup = document.getElementById('savePopup');
    let currenIdNews = null;
    // Control trong popup
    cancelPopup.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });
    cancelPopup2.addEventListener('click', function () {
        editCoursePopup.classList.remove('show');
    });
    // Control 
    editButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const newid = e.target.dataset?.newid;
            const imagePost = e.target.dataset?.image;
            const contentNews = e.target.dataset?.content;
            currenIdNews = newid;
            renderNews(newid, imagePost, contentNews);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            if (!id) return createToast('error');
            delExam(id)
        });
    });




    const delExam = async (id) => {
        try {
            const exam = await fetch(`${localhost}/news/${id}`, {
                method: 'DELETE',
            });
            if (!exam.ok) {
                return createToast('error')
            }
            alert('Xoá bài kiểm tra  thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
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
        await updateCourse(formData, currenIdNews);
    }

    const renderNews = async (id, image, content) => {
        const contentNews = document.getElementById('contentNews');
        contentNews.value = content;
        editCoursePopup.classList.add('show');
        savePopup.removeEventListener('click', handlerEditNews);
        savePopup.addEventListener('click', handlerEditNews);
    }

    const updateCourse = async (data, courseid) => {
        try {
            const cousrse = await fetch(`${localhost}news/${courseid}`, {
                method: 'PUT',
                // headers: {
                //     'Content-Type': 'application/json'
                // },
                body: data
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật bài viết thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


});


