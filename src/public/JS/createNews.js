'use strict';

import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;

const forms = document.querySelectorAll('.needs-validation123');

Array.from(forms).forEach(form => {
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('#submitButton');
        const spinner = submitButton.querySelector('.spinner-border');

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        submitButton.disabled = true; // Vô hiệu hóa nút
        spinner.classList.remove('d-none'); // Hiển thị spinner
        submitButton.textContent = 'Đang xử lý...'; // Thay đổi nội dung của nút

        const formData = new FormData(form);
        try {
            const response = await fetch(`${localhost}news`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            if (data) {
                alert('Tạo thành công!');
                form.reset();
            } else {
                console.log(formData);
            }
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
            console.error('Error:', error);
        } finally {
            form.classList.add('was-validated');
            submitButton.disabled = false;
            spinner.classList.add('d-none');
            location.reload();
        }
    });
});
