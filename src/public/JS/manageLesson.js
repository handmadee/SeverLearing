'use strict';
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;

document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".btn-edit-chapter");
    const deleteButtons = document.querySelectorAll(".btn-delete-chapter");
    const editChapterPopup = document.getElementById('editModalChapter');
    console.log(editChapterPopup)
    const cancelChapter = document.getElementById('cancelChapter');
    console.log(cancelChapter)
    const cancelChapter2 = document.getElementById('cancelChapter2');
    const saveChapter = document.getElementById('saveChapter');
    let currenIdChapter = null;
    let currenIdLesson = null;
    //Lesson
    const edit = document.querySelectorAll(".btn-edit-lesson");
    const deleteLeson = document.querySelectorAll(".btn-delete-lesson");
    const editLesson = document.getElementById('editLesson');
    const cancelLesson = document.getElementById('cancelLesson');
    const cancelLesson2 = document.getElementById('cancelLesson2');
    const saveLesson = document.getElementById('saveLesson');

    cancelLesson.addEventListener('click', function () {
        editLesson.classList.remove('show');
    });
    cancelLesson2.addEventListener('click', function () {
        editLesson.classList.remove('show');
    }
    );
    // Control trong popup
    cancelChapter.addEventListener('click', function () {
        editChapterPopup.classList.remove('show');
    });
    cancelChapter2.addEventListener('click', function () {
        editChapterPopup.classList.remove('show');
    });
    // Control 
    editButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            const idCourse = e.target.dataset.idcourse;
            const titleChapter = e.target.dataset.titlechapter;
            currenIdChapter = id;
            renderCourse(id, titleChapter, idCourse);
        });
    });
    deleteButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            if (!id) return createToast('error');
            delChapter(id)
        });
    });

    // Lesson 
    edit.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            const titleLesson = e.target.dataset.titlelesson;
            const urlVideo = e.target.dataset.urlvideo;
            const time = e.target.dataset.time;
            currenIdLesson = id;
            renderLesson(id, titleLesson, urlVideo, time);
        });
    });
    deleteLeson.forEach(button => {
        button.addEventListener("click", function (e) {
            const id = e.target.value;
            if (!id) return createToast('error');
            delLesson(id)
        });
    });


    const delChapter = async (id) => {
        try {
            const chapter = await fetch(`${localhost}/chapter/${id}`, {
                method: 'DELETE',
            });
            if (!chapter.ok) {
                return createToast('error')
            }
            alert('Xoá chương hoàn thành ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const delLesson = async (id) => {
        try {
            const chapter = await fetch(`${localhost}/lesson/${id}`, {
                method: 'DELETE',
            });
            if (!chapter.ok) {
                return createToast('error')
            }
            alert('Xoá chương bài học hoàn thành ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const editChapter = async () => {
        const formData = {
            titleChapter: document.getElementById('txtChapter').value,
            courseId: document.getElementById('chaptter_id').value
        }
        try {
            await updateChapter(formData, currenIdChapter);
        } catch (error) {
            createToast('error')
        }
    }

    // @edit Lesson 
    const fneditLesson = async () => {
        const formData = {
            titleLesson: document.getElementById('titleLesson').value,
            time: document.getElementById('timeLesson').value,
            urlVideo: document.getElementById('urlVideo').value
        }
        await updateLesson(formData, currenIdLesson);
    }


    const renderCourse = async (id, titleChapter, idCourse) => {
        const titleChapter12 = document.getElementById('txtChapter');
        const category123 = document.getElementById('chaptter_id');
        try {
            const categoryCourse = await fetch(`${localhost}/courseFull`)
            if (!categoryCourse.ok) {
                return createToast('error')
            }
            const data = await categoryCourse.json();
            const category = data?.data?.data;
            category.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.text = item?.title;
                category123.appendChild(option);
            });
            titleChapter12.value = titleChapter;
            category123.value = idCourse;
            editChapterPopup.classList.add('show');
            saveChapter.removeEventListener('click', editChapter);
            // Save
            saveChapter.addEventListener('click', editChapter);
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const renderLesson = async (id, titleLesson, urlVideo, time) => {
        const title = document.getElementById('titleLesson');
        const url = document.getElementById('timeLesson');
        const timer = document.getElementById('urlVideo');
        title.value = titleLesson;
        url.value = time;
        timer.value = urlVideo;
        editLesson.classList.add('show');
        // Save
        saveLesson.removeEventListener('click', fneditLesson);
        saveLesson.addEventListener('click', fneditLesson);
    }
    const updateChapter = async (formData, id) => {
        console.log(formData)
        console.log(id)
        try {
            const cousrse = await fetch(`${localhost}chapter/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            createToast('success')
            location.reload();
        } catch (error) {
            return createToast('error')
        }
    }
    const updateLesson = async (formData, id) => {
        console.log(formData)
        console.log(id)
        try {
            const cousrse = await fetch(`${localhost}lesson/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật bài học thành công ');
            location.reload();
        } catch (error) {
            return createToast('error')
        }
    }


    // Edit lesson

});



for (let i = 0; i < 6; i++) {
    console.log(i * "*")
}