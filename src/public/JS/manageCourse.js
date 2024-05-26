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
            const id = e.target.dataset.courseid;
            fetchCourse(id)
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.dataset.courseid;
            if (!id) return createToast('error');
            delCourse(id)
        });
    });

    const delCourse = async (courseid) => {
        try {
            const cousrse = await fetch(`${localhost}/course/${courseid}`, {
                method: 'DELETE',
            });
            if (!cousrse.ok) {
                return createToast('Xoá khoá học thất bại')
            }
            alert('Xoá khoá học thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('Xoá khoá học thất bại')
        }
    }

    const fetchCourse = async (courseid) => {
        const accessToken = document.cookie.split(';').find(cookie => cookie.includes('accessToken')).split('=')[1];
        try {
            // gửi lên 1 header để xác định là admin
            const cousrse = await fetch(`${localhost}course/${courseid}`, {
                method: 'GET',
                headers: {

                    'authorization': `Bearer ${accessToken}`
                }
            })
            console.log(cousrse)
            if (!cousrse.ok) {
                return createToast('error')
            }
            const data = await cousrse.json();
            const { title, detailCourse, imageCourse, category_id } = data?.data?.data;
            renderCourse(courseid, title, detailCourse, imageCourse, category_id);
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


    const renderCourse = async (idCourse, title, detailCourse, imageCourse, category_id) => {
        const titleCourse = document.getElementById('title');
        const detail = document.getElementById('detailCourse');
        const image = document.getElementById('imageCourse');
        const category123 = document.getElementById('chaptter_id');

        try {
            const categoryCourse = await fetch(`${localhost}/category`)
            if (!categoryCourse.ok) {
                return createToast('error')
            }
            const data = await categoryCourse.json();
            console.log(data)
            const category = data?.data?.data;
            category.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.text = item?.nameCategory;
                category123.appendChild(option);
            });
            titleCourse.value = title;
            detail.value = detailCourse;
            category123.value = category_id;
            editCoursePopup.classList.add('show');
            // Save
            savePopup.addEventListener('click', async function () {
                const formData = new FormData();
                formData.append('title', titleCourse.value);
                formData.append('detailCourse', detail.value);
                if (image.files.length > 0) {
                    formData.append('imageCourse', image.files[0]);
                }
                formData.append('category_id', category123.value);

                await updateCourse(formData, idCourse);
            });
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const updateCourse = async (formData, courseid) => {
        try {
            const cousrse = await fetch(`${localhost}course/${courseid}`, {
                method: 'PUT',
                body: formData
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật khoá học thành công ');
            location.reload();
        } catch (error) {
            return createToast('error')
        }
    }
});


