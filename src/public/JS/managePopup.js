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
    let currentIdPopup = null;
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
            currentIdPopup = id;
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
            const exam = await fetch(`${localhost}/popup/${id}`, {
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

    const hanlderEditPopup = async function () {
        const popupImage = document.getElementById('popupImage');
        const formData = new FormData();
        if (popupImage.files.length > 0) {
            formData.append('popupImage', popupImage.files[0]);
        }
        await updateCourse(formData, currentIdPopup);
    };
    const renderExam = async (id) => {
        editCoursePopup.classList.add('show');
        savePopup.removeEventListener('click', hanlderEditPopup);
        savePopup.addEventListener('click', hanlderEditPopup);
    }

    const updateCourse = async (data, id) => {
        try {
            const slider = await fetch(`${localhost}popup/${id}`, {
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


