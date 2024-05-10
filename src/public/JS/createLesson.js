'use strict';


const formExam = document.querySelectorAll('.needs-validation');
const formChapter = document.querySelectorAll('.needs-validation123');
import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;


// Select course 
const selectCourse = document.getElementById('selectCourse123');
selectCourse.addEventListener('change', async (event) => {
    const courseId = event.target.value;
    const selectChapter = document.getElementById('selectChapter');
    selectChapter.innerHTML = '<option disabled selected>Loading...</option>';
    const response = await fetch(`${localhost}chapterCourse/${courseId}`);
    const data = await response.json();
    const chapter = data?.data?.data;
    console.log(chapter)

    selectChapter.innerHTML = '';

    chapter.forEach(item => {
        const option = document.createElement('option');
        option.value = item._id;
        option.text = item?.titleChapter;
        selectChapter.appendChild(option);
    });
});



Array.from(formExam).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const title = formData.get("titleLesson");
        const url = formData.get("urlVideo");
        const time = formData.get("time");
        const chapterId = formData.get("selectChapter");

        const postData = {
            titleLesson: title,
            time: time,
            urlVideo: url,
            chaptter_id: chapterId
        };
        fetch(`${localhost}lesson`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                if (data) {
                    alert('Tạo thành công!');
                } else {
                    console.log(formData);
                }
            })
            .catch(error => {
                console.log(error)
                alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
                console.error('Error:', error);
            })
            .finally(() => {
                form.classList.add('was-validated');
            });
    });
});


Array.from(formChapter).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const title = formData.get("titleChapter");
        const chapterId = formData.get("selectCourse");

        const postData = {
            titleChapter: title,
            courseId: chapterId
        };
        fetch(`${localhost}chapter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                if (data) {
                    form.reset();
                    alert('Tạo thành công!');
                } else {
                    console.log(formData);
                }
            })
            .catch(error => {
                console.log(error)
                alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
                console.error('Error:', error);
            })
            .finally(() => {
                form.classList.add('was-validated');
            });
    });
});
