'use strict';
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;

document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".btn-edit-question ");
    const deleteButtons = document.querySelectorAll(".btn-delete-question");
    const editChapterPopup = document.getElementById('editModalChapter');

    const cancelChapter = document.getElementById('cancelChapter');
    console.log(cancelChapter)
    const cancelChapter2 = document.getElementById('cancelChapter2');
    const saveChapter = document.getElementById('saveChapter');

    let currentIdQuestion = null;
    let currentIdAnswer = null;
    //Lesson
    const edit = document.querySelectorAll(".btn-edit-answer");
    const deleteLeson = document.querySelectorAll(".btn-delete-answer");
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
            const titleQuestion = e.target.dataset.title;
            currentIdQuestion = id;
            renderQuestion(id, titleQuestion);

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
            const title = e.target.dataset.title;
            const correct = e.target.dataset.iscorrect;
            console.log(correct)
            currentIdAnswer = id;
            renderAnswer(id, title, correct);
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
            const chapter = await fetch(`${localhost}/questionQuiz/${id}`, {
                method: 'DELETE',
            });
            if (!chapter.ok) {
                return createToast('error')
            }
            alert('Xoá câu hỏi thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const delLesson = async (id) => {
        try {
            const chapter = await fetch(`${localhost}/answerQuiz/${id}`, {
                method: 'DELETE',
            });
            if (!chapter.ok) {
                return createToast('error')
            }
            alert('Xoá chương câu trả lời thành công');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    const editQuestion = async function () {
        const titleChapter12 = document.getElementById('txtChapter');
        const image = document.getElementById('imageQuestion12');
        const formData = new FormData();
        formData.append('title', titleChapter12.value);
        if (image.files.length > 0) {
            formData.append('imageQuestion', image.files[0]);
        }
        await updateQuestion(formData, currentIdQuestion);
    }

    const renderQuestion = async (id, titleChapter) => {
        const titleChapter12 = document.getElementById('txtChapter');
        titleChapter12.value = titleChapter;
        editChapterPopup.classList.add('show');
        saveChapter.removeEventListener('click', editQuestion);
        saveChapter.addEventListener('click', editQuestion);
    }

    const editAnswer = async function () {
        const titleAnswer = document.getElementById('titleAnswer');
        const isCorrect = document.getElementById('isCorrect');
        const formData = {
            titleAnswer: titleAnswer.value,
            isCorrect: isCorrect.value
        }
        await updateLesson(formData, currentIdAnswer);
    }
    const renderAnswer = async (id, title, correct) => {
        const titleAnswer = document.getElementById('titleAnswer');
        const isCorrect = document.getElementById('isCorrect');
        titleAnswer.value = title;
        isCorrect.value = correct;
        editLesson.classList.add('show');
        saveLesson.removeEventListener('click', editAnswer);
        saveLesson.addEventListener('click', editAnswer);
    }
    const updateQuestion = async (formData, id) => {
        try {
            const cousrse = await fetch(`${localhost}questionQuiz/${id}`, {
                method: 'PUT',
                body: formData
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật câu hỏi thành công ');
            location.reload();
        } catch (error) {
            console.log(error)

            return createToast('error')
        }
    }
    // Update Lesso
    const updateLesson = async (formData, id) => {
        try {
            const cousrse = await fetch(`${localhost}answerQuiz/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            alert('Cập nhật câu trả lời thành công ');
            location.reload();
        } catch (error) {
            return createToast('error')
        }
    }



});


