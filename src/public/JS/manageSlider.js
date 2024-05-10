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
            const id = e.target.value;
            renderExam(id);
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
            const exam = await fetch(`${localhost}/notificationList/${id}`, {
                method: 'DELETE',
            });
            if (!exam.ok) {
                return createToast('error')
            }
            alert('Xoá bài notification thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const renderExam = async (id) => {
        const imagePost = document.getElementById('urlImage');
        editCoursePopup.classList.add('show');
        savePopup.addEventListener('click', async function () {
            const formData = new FormData();
            if (imagePost.files.length > 0) {
                formData.append('listNotificaiton', imagePost.files[0]);
            }
            await updateCourse(formData, id);
        });
    }

    const updateCourse = async (data, id) => {
        try {
            const slider = await fetch(`${localhost}notificationList/${id}`, {
                method: 'PUT',
                body: data
            });
            if (!slider.ok) {
                return createToast('error')
            }
            alert('Cập nhật notification thành công');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


});


