'use strict';

const forms = document.querySelectorAll('.needs-validation');
const formsCategory = document.querySelectorAll('.needs-validation123');
import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;

Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        const formData = new FormData(form);
        fetch(`${localhost}course`, {
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
                form.classList.add('was-validated');
            });
    });
});


Array.from(formsCategory).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        const nameCategory = document.getElementById('nameCategory').value;

        fetch(`${localhost}category`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nameCategory
            })
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
                    form.reset();
                } else {
                    console.log(data);
                }
            })
            .catch(error => {
                alert('Có lỗi xảy ra, vui lòng thử lại.');
                console.error('Error:', error);
            })
            .finally(() => {
                form.classList.add('was-validated');
            });
    });
});
