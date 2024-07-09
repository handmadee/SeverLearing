import { LOCALHOST_API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('notification-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectUsers = document.getElementById('select-users').value;
        const type = document.getElementById('type').value;
        const title = document.getElementById('title').value;
        const includeImage = document.getElementById('include-image').files[0];
        const message = document.getElementById('message').value;

        let selectedUsers = Array.from(document.querySelectorAll(selectUsers === 'selected' ? '.user-checkbox:checked' : '.user-checkbox')).map(checkbox => checkbox.value);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', includeImage);
        formData.append('body', message);
        selectedUsers.forEach(userId => formData.append('token[]', userId));

        let url = '';
        switch (type) {
            case 'default':
                url = `${LOCALHOST_API_URL}app/pushNotification`;
                break;
            case 'inDays':
                const date = document.getElementById('select-date').value;
                const jobId = document.getElementById('jobId').value;
                formData.append('date', date);
                formData.append('jobId', jobId);
                url = `${LOCALHOST_API_URL}app/scheduleNotification`;
                break;
            case 'inMonth':
                const selectDate = document.getElementById('select-date').value;
                const selectTime = document.getElementById('select-time').value;
                const jobId12 = document.getElementById('jobId').value;
                formData.append('dayOfMonth', new Date(selectDate).getDate());
                formData.append('hour', selectTime.split(':')[0]);
                formData.append('minute', selectTime.split(':')[1]);
                formData.append('jobId', jobId12);
                url = `${LOCALHOST_API_URL}app/scheduleNotificationMonth`;
                break;
            case 'inYear':
                const selectTime12 = document.getElementById('select-time').value;
                const jobId123 = document.getElementById('jobId').value;
                formData.append('hour', selectTime12.split(':')[0]);
                formData.append('jobId', jobId123);
                url = `${LOCALHOST_API_URL}app/scheduleNotificationDaily`;
                break;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            alert(data.status === 200 ? 'Notification sent successfully!' : 'Notification failed to send!');
            if (data.status === 200) location.reload();
        } catch (error) {
            console.log({
                message: `error:: `,
                error
            })
            console.error('Error:', error);
        }
    });

    document.getElementById('select-all').addEventListener('change', function () {
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Search users for by name
    document.getElementById('get-selected-users').addEventListener('click', async () => {
        const searchValue = document.getElementById('search').value;
        const response = await fetch(`${LOCALHOST_API_URL}/fcmtoken/search?name=${searchValue}`);
        const data = await response.json();
        const users = data.data;
        console.log(users);
        const usersList = document.getElementById('users-list');

        // usersList.innerHTML = '';
        // users.forEach(user => {
        //     const userElement = document.createElement('tr');
        //     userElement.innerHTML = `
        //         <input type="checkbox" class="user-checkbox" value="${user.fcmToken}" />
        //         <label>${user.username}</label>
        //     `;
        //     usersList.appendChild(userElement);
        // });
    });

});
