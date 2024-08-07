'use strict';

const forms = document.querySelectorAll('.needs-validation123');
import { LOCALHOST_API_URL } from './config.js'
const listDel = document.querySelectorAll('.delete');

Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        const formData = new FormData(form);
        const { password, username, pemission } = Object.fromEntries(formData.entries());
        console.log(password, username, pemission)
        fetch(`${LOCALHOST_API_URL}auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, username, pemission }),
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
                    location.reload();
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

listDel.forEach(item => {
    item.addEventListener('click', async (e) => {
        try {
            const id = e.target.value;
            await fetch(`${LOCALHOST_API_URL}deleteAccount/${id}`, {
                method: 'DELETE',
            });
            alert('Xoá thành công')
            location.reload();
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại.' + error);
        }
    })
})