'use strict';
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
            const newid = e.target.value;
            const nameCategory = e.target.dataset?.namecategory;
            renderCategory(newid, nameCategory);
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
            const exam = await fetch(`${localhost}/categoryQuiz/${id}`, {
                method: 'DELETE',
            });
            if (!exam.ok) {
                return createToast('error')
            }
            alert('Xoá danh mục thành công ');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }

    let isSavePopupListenerAdded = false;
    const renderCategory = async (id, nameCategory) => {
        const cate = document.getElementById('nameCategory');
        cate.value = nameCategory;
        editCoursePopup.classList.add('show');
        const image = document.getElementById('imageCategory');
        const form = new FormData();

        if (!isSavePopupListenerAdded) {
            savePopup.addEventListener('click', async function () {
                form.append('nameCategory', cate.value);
                if (image.files.length > 0) {
                    form.append('imageCategory', image.files[0]);
                }
                await updateCourse(form, id);
            });
            isSavePopupListenerAdded = true;
        }
    };


    const updateCourse = async (data, courseid) => {
        try {
            const cousrse = await fetch(`${localhost}categoryQuiz/${courseid}`, {
                method: 'PUT',
                body: data
            });
            if (!cousrse.ok) {
                return createToast('error')
            }
            console.log(await cousrse.json())
            alert('Cập nhật danh mục thành công');
            location.reload();
        } catch (error) {
            console.log(error)
            return createToast('error')
        }
    }


});


