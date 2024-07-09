'use strict';

import { LOCALHOST_API_URL } from './config.js';

const localhost = LOCALHOST_API_URL;

document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('.needs-validation');
    const formsCategory = document.querySelectorAll('.needs-validation123');

    forms.forEach(form => {
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Disable submit button and show loading spinner
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

            try {
                const formData = new FormData(form);
                const response = await fetch(`${localhost}course`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }

                const data = await response.json();
                if (data) {
                    alert('Tạo khoá học thành công!');
                    form.reset();
                } else {
                    throw new Error('Response data was empty.');
                }
            } catch (error) {
                alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
                console.error('Error:', error);
            } finally {
                // Enable submit button and hide loading spinner
                this.location.reload();
            }
        });
    });

    formsCategory.forEach(form => {
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Disable submit button and show loading spinner
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

            try {
                const nameCategory = document.getElementById('nameCategory').value;
                const response = await fetch(`${localhost}category`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nameCategory
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }

                const data = await response.json();
                if (data) {
                    alert('Tạo danh mục thành công!');
                    form.reset();
                } else {
                    throw new Error('Response data was empty.');
                }
            } catch (error) {
                alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
                console.error('Error:', error);
            } finally {
                this.location.reload();
            }
        });
    });
});
