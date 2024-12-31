'use strict';

const forms = document.querySelectorAll('.needs-validation');
import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;

const createCategory = document.getElementById('createCate');
Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        const button = createCategory;
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        const formData = new FormData(form);
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Update...`;
        fetch(`${localhost}categoryQuiz`, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                console.log(formData)
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                if (data) {
                    alert('Tạo thành công!');
                    form.reset();
                } else {
                    console.log(formData);
                }
            })
            .catch(error => {
                alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
                console.error('Error:', error);
            })
            .finally(() => {
                button.disabled = false;
                button.innerHTML = originalText;
                form.classList.add('was-validated');
            });
    });
});
