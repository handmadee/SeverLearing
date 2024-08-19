import { LOCALHOST_API_URL } from "./config.js";
export class authApi {
    constructor() {
        this.api = LOCALHOST_API_URL;
    }
    async login(data) {
        const response = await fetch(`${this.api}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result;
    }
    async register(data) {
        const response = await fetch(`${this.api}register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result;
    }
    async verifyToken(token) {
        const response = await fetch(`${this.api}verify-token`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        const result = await response.json();

        return result;
    }
    async refreshToken(data) {
        const response = await fetch(`${this.api}refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result;
    }

}


export const queryStudents = async (query) => {
    try {
        const response = await fetch(`${LOCALHOST_API_URL}${query}`);
        const data = await response.json();
        return data?.data?.data
    } catch (err) {
        console.log(err)
        alert("Đã có lỗi xảy ra !")
    }
};
