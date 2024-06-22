'use strict';
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;
document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");
    const showInfoButtons = document.querySelectorAll(".btn-infor");
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
            fetchExam(id)
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            if (!id) return createToast('error');
            delExam(id)
        });
    });

    showInfoButtons.forEach(button => {
        button.addEventListener("click", function (e) {

        });
    });


    const delExam = async (id) => {
        try {
            const exam = await fetch(`${localhost}quizExam/${id}`, {
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

    const fetchExam = async (id) => {
        const accessToken = document.cookie.split(';').find(cookie => cookie.includes('accessToken'))?.split('=')[1];
        if (!accessToken) {
            return createToast('error');
        }
        try {
            const cousrse = await fetch(`${localhost}quizExam/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            )
            if (!cousrse.ok) {
                return createToast('error')
            }
            const data = await cousrse.json();
            const { title, time, points, level, categoryQuiz_id } = data?.data?.data;
            renderExam(id, title, time, points, level, categoryQuiz_id);
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


    const renderExam = async (idExam, title, timeEx, pointsEx, levelEx, categoryEx) => {
        const titleXam = document.getElementById('title');
        const time = document.getElementById('time');
        const points = document.getElementById('points');
        const categoryExam12 = document.getElementById('categoryQuiz_id');
        const level = document.getElementById('level');
        try {
            const categoryExam = await fetch(`${localhost}categoryQuiz`)
            if (!categoryExam.ok) {
                return createToast('error')
            }
            const data = await categoryExam.json();
            const category = data?.data?.data;
            category.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.text = item?.nameCategory;
                categoryExam12.appendChild(option);
            });
            //  Change value
            titleXam.value = title;
            time.value = timeEx;
            points.value = pointsEx;
            categoryExam12.value = categoryEx;
            level.value = levelEx;
            editCoursePopup.classList.add('show');

            savePopup.addEventListener('click', async function () {
                const formData = {
                    title: titleXam.value,
                    time: time.value,
                    points: points.value,
                    level: level.value,
                    categoryQuiz_id: categoryExam12.value
                }
                return await updateCourse(formData, idExam);
            });
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const updateCourse = async (data, courseid) => {
        try {
            const cousrse = await fetch(`${localhost}quizExam/${courseid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật bài kiểm tra thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


});


