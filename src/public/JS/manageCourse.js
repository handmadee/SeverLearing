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
    const loadingOverlay = document.getElementById('loadingOverlay');
    let currentIDCourse = null;

    // Hàm hiển thị loading
    function showLoading() {
        loadingOverlay.classList.remove('d-none');
    }
    // Hàm ẩn loading
    function hideLoading() {
        loadingOverlay.classList.add('d-none');
    }

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
            showLoading(); // Hiển thị loading khi xoá khóa học

            const response = await fetch(`${LOCALHOST_API_URL}/course/${courseId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Xóa khóa học thất bại');

            alert('Xóa khóa học thành công');
            location.reload();
        } catch (error) {
            console.error(error);
            createToast('error');
        } finally {
            hideLoading(); // Ẩn loading sau khi hoàn tất
        }
    };

    const fetchCourse = async (courseId) => {
        try {
            showLoading(); // Hiển thị loading khi lấy thông tin khóa học

            const accessToken = document.cookie.split(';').find(cookie => cookie.includes('accessToken'))?.split('=')[1];
            if (!accessToken) {
                return createToast('error');
            }

            const response = await fetch(`${LOCALHOST_API_URL}/course/${courseId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) throw new Error('Lấy khóa học thất bại');

            const data = await response.json();
            const { title, detailCourse, imageCourse, category_id } = data?.data?.data;
            currentIDCourse = courseId;
            renderCourse(courseId, title, detailCourse, imageCourse, category_id);
        } catch (error) {
            console.error(error);
            createToast('error');
        } finally {
            hideLoading(); // Ẩn loading sau khi hoàn tất
        }
    };

    const handleSave = async () => {
        showLoading(); // Hiển thị loading khi cập nhật khóa học

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('detailCourse', document.getElementById('detailCourse').value);
        if (document.getElementById('imageCourse').files.length > 0) {
            formData.append('imageCourse', document.getElementById('imageCourse').files[0]);
        }
        formData.append('category_id', document.getElementById('chaptter_id').value);
        await updateCourse(formData, currentIDCourse);

        hideLoading(); // Ẩn loading sau khi hoàn tất
    };

    const renderCourse = async (courseId, title, detailCourse, imageCourse, categoryId) => {
        try {
            showLoading(); // Hiển thị loading khi render thông tin khóa học

            const response = await fetch(`${LOCALHOST_API_URL}/category`);
            if (!response.ok) throw new Error('Lấy danh mục thất bại');
            const data = await response.json();
            const categories = data?.data?.data;
            const categorySelect = document.getElementById('chaptter_id');
            categorySelect.innerHTML = '';
            categories.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.textContent = item.nameCategory;
                categorySelect.appendChild(option);
            });

            document.getElementById('title').value = title;
            document.getElementById('detailCourse').value = detailCourse;
            document.getElementById('chaptter_id').value = categoryId;

            editCoursePopup.classList.add('show');
            savePopup.removeEventListener('click', handleSave);
            savePopup.addEventListener('click', handleSave);
        } catch (error) {
            console.error(error);
            createToast('error');
        } finally {
            hideLoading(); // Ẩn loading sau khi hoàn tất
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
        } finally {
            hideLoading(); // Ẩn loading sau khi hoàn tất
        }
    };
});
