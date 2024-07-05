
import { LOCALHOST_API_URL } from './config.js'
const localhost = LOCALHOST_API_URL;

const dels = document.querySelectorAll('.delete');


dels.forEach((del) => {
    del.addEventListener('click', async (e) => {
        const jobId = e.target.value;
        try {
            await fetch(`${localhost}app/cancelNotification/${jobId}`, {
                method: 'DELETE'
            });
            alert('Xóa thông báo thành công!');
            location.reload();

        } catch (error) {
            console.error('Error:', error);
        }
    });
});