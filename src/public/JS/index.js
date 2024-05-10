const container = document.getElementById('container');
const registerBtn = document.getElementById('Signup');
const loginAdmin = document.getElementById('Loginadmin');
const email = document.getElementById('email');
const password = document.getElementById('password');
import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;


registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginAdmin.addEventListener('click', async (e) => {
    e.preventDefault();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    if (emailValue === '' || passwordValue === '') {
        return createToast('info');
    }
    const postData = {
        username: emailValue,
        password: passwordValue
    };
    try {
        const response = await fetch(`${localhost}auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        if (!response.ok) {
            return createToast('login');
        }
        const data = await response.json();
        const { accessToken, refreshToken, role } = data?.data?.data;
        if (!role.includes('999')) {
            return window.location.href = '/admin/403';
        }
        // Set cookies for tokens
        document.cookie = `accessToken=${accessToken}; path=/;`;
        document.cookie = `refreshToken=${refreshToken}; path=/;`;
        window.location.href = '/admin/dashboard';
    } catch (error) {
        console.log(error);
        createToast('login')
    }
});






