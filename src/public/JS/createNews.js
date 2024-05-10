'use strict';

const forms = document.querySelectorAll('.needs-validation123');
import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;

Array.from(forms).forEach(form => {
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        const formData = new FormData(form);
        try {
            const response = await fetch(`${localhost}news`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                console.log(formData);
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
        }
    });
});