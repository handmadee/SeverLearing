import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;



document.addEventListener('DOMContentLoaded', function () {
    const isCorrectAnswerSelect = document.getElementById('isCorrectAnswer');
    const addAnswerBtn = document.getElementById('addAnswerBtn');
    const answerContainer = document.getElementById('answerContainer');
    let answerCount = 2; // Số đáp án ban đầu

    // Tạo các tùy chọn cho phần chọn đáp án đúng ban đầu
    for (let i = 0; i < answerCount; i++) {
        const option = createOption(i);
        isCorrectAnswerSelect.appendChild(option);
    }

    // Sự kiện khi người dùng thêm đáp án mới
    addAnswerBtn.addEventListener('click', function (event) {
        event.preventDefault();
        if (answerCount < 6) { // Giới hạn số lượng đáp án
            answerCount++;
            const newIndex = answerCount - 1;
            const newAnswer = createAnswer(newIndex);
            answerContainer.appendChild(newAnswer);
            const option = createOption(newIndex);
            isCorrectAnswerSelect.appendChild(option);
        } else {
            alert('Bạn chỉ có thể thêm tối đa 6 câu trả lời.');
        }
    });

    // Sự kiện khi người dùng xoá đáp án
    answerContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('removeAnswerBtn')) {
            const answer = event.target.parentElement;
            answer.remove();
            answerCount--;
            updateOptions(answerCount);
        }
    });

    // Hàm tạo tùy chọn cho phần chọn đáp án đúng
    function createOption(index) {
        const option = document.createElement('option');
        option.value = index.toString();
        option.text = `Đáp án ${index + 1}`;
        return option;
    }

    // Hàm tạo đáp án mới
    function createAnswer(index) {
        const newAnswer = document.createElement('div');
        newAnswer.classList.add('answer');
        newAnswer.innerHTML = `
            <label for="answer${index}" class="form-label">Đáp án ${index + 1}</label>
            <input type="text" class="form-control answerInput" id="answer${index}" name="answer${index}" required>
            <div class="valid-feedback">Looks good!</div>
            <div class="invalid-feedback">Vui lòng nhập nội dung câu trả lời</div>
            <button class="removeAnswerBtn">Xoá</button>
        `;
        return newAnswer;
    }

    // Hàm cập nhật tùy chọn cho phần chọn đáp án đúng khi có thay đổi số lượng đáp án
    function updateOptions(count) {
        while (isCorrectAnswerSelect.options.length > count) {
            isCorrectAnswerSelect.remove(isCorrectAnswerSelect.options.length - 1);
        }
    }



    // Changer server
    const forms = document.querySelectorAll('.needs-validation');
    const formsCategory = document.querySelectorAll('.needs-validation12');




    Array.from(formsCategory).forEach(form => {
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
            submitBtn.disabled = true;

            const question = form?.title?.value;
            const image = form?.imageQuestion?.files[0];
            const quiz = form?.selectGame?.value;
            const arrAnswer = document.querySelectorAll('.answerInput');
            const isCorrect = document.getElementById('isCorrectAnswer').value;


            const questionForm = new FormData();
            questionForm.append('title', question);
            questionForm.append('quiz', quiz);
            questionForm.append('imageQuestion', image);


            try {
                const questionResponse = await fetch(`${localhost}questionQuiz`, {
                    method: 'POST',
                    body: questionForm
                });
                if (!questionResponse.ok) {
                    throw new Error('Không thể tạo câu hỏi');
                }
                const questionData = await questionResponse.json();
                const questionId = questionData?.data?.data?._id;
                console.log(questionId)
                const answerRequests = Array.from(arrAnswer).map(async (item, index) => {
                    const response = await fetch(`${localhost}answerQuiz`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            titleAnswer: item.value,
                            isCorrect: isCorrect === index.toString(),
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
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            } finally {
                submitBtn.innerHTML = 'Create Question'; // Hoặc nội dung ban đầu của nút
                submitBtn.disabled = false;
                formQuestion.classList.add('was-validated');
            }

        });
    });

    // Create Quiz Game
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();

            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }
            const postData = {
                title: form.title.value,
                time: form.time.value,
                level: form.level.value,
                points: form.points.value,
                categoryQuiz_id: form.categoryQuiz_id.value,
            };
            console.log(postData)
            fetch(`${localhost}quizExam`, {
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
                        window.location.reload();
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





});

