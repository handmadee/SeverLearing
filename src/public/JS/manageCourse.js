'use strict';

import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';


document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");
    const editCoursePopup = document.getElementById('editModal');
    const cancelPopup = document.getElementById('cancelPopup');
    const cancelPopup2 = document.getElementById('cancelPopup2');
    const savePopup = document.getElementById('savePopup');

    cancelPopup.addEventListener('click', () => editCoursePopup.classList.remove('show'));
    cancelPopup2.addEventListener('click', () => editCoursePopup.classList.remove('show'));

    editButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const id = e.target.dataset.courseid;
            if (id) fetchCourse(id);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const id = e.target.dataset.courseid;
            if (!id) return createToast('error');
            delCourse(id);
        });
    });

    const delCourse = async (courseId) => {
        try {
            const response = await fetch(`${LOCALHOST_API_URL}/course/${courseId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Xóa khóa học thất bại');
            alert('Xóa khóa học thành công');
            location.reload();
        } catch (error) {
            console.error(error);
            createToast('error');
        }
    };

    const fetchCourse = async (courseId) => {
        const accessToken = document.cookie.split(';').find(cookie => cookie.includes('accessToken'))?.split('=')[1];
        if (!accessToken) {
            return createToast('error');
        }

        try {
            const response = await fetch(`${LOCALHOST_API_URL}/course/${courseId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) throw new Error('Lấy khóa học thất bại');

            const data = await response.json();
            const { title, detailCourse, imageCourse, category_id } = data?.data?.data;
            renderCourse(courseId, title, detailCourse, imageCourse, category_id);
        } catch (error) {
            console.error(error);
            createToast('error');
        }
    };

    const renderCourse = async (courseId, title, detailCourse, imageCourse, categoryId) => {
        const titleInput = document.getElementById('title');
        const detailInput = document.getElementById('detailCourse');
        const imageInput = document.getElementById('imageCourse');
        const categorySelect = document.getElementById('chaptter_id');

        try {
            const response = await fetch(`${LOCALHOST_API_URL}/category`);
            if (!response.ok) throw new Error('Lấy danh mục thất bại');

            const data = await response.json();
            const categories = data?.data?.data;

            categorySelect.innerHTML = '';
            categories.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.textContent = item.nameCategory;
                categorySelect.appendChild(option);
            });

            titleInput.value = title;
            detailInput.value = detailCourse;
            categorySelect.value = categoryId;
            editCoursePopup.classList.add('show');

            const handleSave = async () => {
                const formData = new FormData();
                formData.append('title', titleInput.value);
                formData.append('detailCourse', detailInput.value);
                if (imageInput.files.length > 0) {
                    formData.append('imageCourse', imageInput.files[0]);
                }
                formData.append('category_id', categorySelect.value);

                await updateCourse(formData, courseId);
            };
            savePopup.removeEventListener('click', handleSave);
            savePopup.addEventListener('click', handleSave);
        } catch (error) {
            console.error(error);
            createToast('error');
        }
    };

    const updateCourse = async (formData, courseId) => {
        try {
            const response = await fetch(`${LOCALHOST_API_URL}/course/${courseId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) throw new Error('Cập nhật khóa học thất bại');
            alert('Cập nhật khóa học thành công');
            location.reload();
        } catch (error) {
            console.error(error);
            createToast('error');
        }
    };
});
