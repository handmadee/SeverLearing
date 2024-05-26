import { LOCALHOST_API_URL } from './config.js';
const localhost = LOCALHOST_API_URL;

function keepAlive() {
    setInterval(async () => {
        try {
            await fetch(`${localhost}keep-alive`);
        } catch (error) {
            console.error('Error:', error);
        }
    }, 1000 * 60 * 5);
}

export { keepAlive };