// Create Exam 

'use strict';


const formExam = document.querySelectorAll('.needs-validation');
const formQuestion = document.querySelectorAll('.needs-validation12');
const formQuestion1 = document.getElementById('formQuestion');
import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;



// Select course 
const selectCourse = document.getElementById('selectCourse');
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
// Post Form Exam

Array.from(formExam).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const title = formData.get("title");
        const time = formData.get("time");
        const chapterId = formData.get("selectChapter");

        const postData = {
            title: title,
            time: time,
            chaptter_id: chapterId
        };
        fetch(`${localhost}quiz`, {
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


// Create Question
const selectCourse12 = document.getElementById('selectCourseQuestion');
selectCourse12.addEventListener('change', async (event) => {
    const courseId = event.target.value;
    const selectChapter = document.getElementById('selectChapterQuestion');
    selectChapter.innerHTML = '<option disabled selected>Loading...</option>';
    const response = await fetch(`${localhost}chapterCourse/${courseId}`);
    const data = await response.json();
    const chapter = data?.data?.data;
    console.log(chapter)

    selectChapter.innerHTML = '';

    chapter.forEach(item => {
        item?.exams && item?.exams?.forEach(exam => {
            const option = document.createElement('option');
            option.value = exam?._id;
            option.text = item?.titleChapter + ' - ' + exam?.title;
            selectChapter.appendChild(option);
        })
    });
});
// Post Form Question
Array.from(formQuestion).forEach(form => {
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        };
        try {
            const question = document.getElementById('questionTitle').value;
            const exam_id = document.getElementById('selectChapterQuestion').value;
            const arrAnswer = document.querySelectorAll('.answer');
            const isCorrect = document.getElementById('isCorrectAnswer');
            const questionResponse = await fetch(`${localhost}question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question, exam_id })
            });
            if (!questionResponse.ok) {
                throw new Error('Không thể tạo câu hỏi');
            }
            const questionData = await questionResponse.json();
            const questionId = questionData?.data?.data?._id;

            const answerRequests = Array.from(arrAnswer).map(async (item, index) => {
                const response = await fetch(`${localhost}answer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titleAnswer: item.value,
                        isCorrect: isCorrect.value === index.toString(),
                        question_id: questionId
                    })
                });
                if (!response.ok) {
                    throw new Error('Không thể tạo câu trả lời');
                }
                return response.json();
            });

            await Promise.all(answerRequests);
            alert('Tạo thành công!');
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            formQuestion.classList.add('was-validated');
        }
    });
});

