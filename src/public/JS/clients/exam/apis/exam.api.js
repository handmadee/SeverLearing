'use strict';

import { LOCALHOST_API_URL } from "../../../config.js";

const localhost = LOCALHOST_API_URL;

const checkExamApi = async (idExam, idStudent) => {
    try {
        const response = await fetch(`${localhost}examQuestion/check-exam`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    examId: idExam,
                    studentId: idStudent
                })
            }
        )
        return response;
    } catch (error) {
        console.log(error);
        throw new error;
    }
}

const startExamApi = async (idExam, idStudent) => {
    try {
        return await fetch(`${localhost}examQuestion/start`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    examId: idExam,
                    studentId: idStudent
                })
            }
        )
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}

const getAllExams = async ({
    page = 1,
    limit = 20,
    status = true,
    search = ''
} = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            status: status.toString()
        });
        if (search) {
            params.append('search', search);
        }

        const response = await fetch(`${localhost}examQuestion?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đề thi:', error);
        throw new Error('Không thể lấy danh sách đề thi. Vui lòng thử lại sau!');
    }
};


const getExamById = async (ID) => {
    try {
        const response = await fetch(`${localhost}/examQuestion/find/${ID}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}
//! thieeus submit
const submitExamV = async ({ idExam, idStudent, studentAnswers }) => {
    try {
        const response = await fetch(`${localhost}examQuestion/submit`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    examRef: idExam,
                    userRef: idStudent,
                    studentAnswers
                })
            }
        )
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}


const getHistoryExam = async (examId, studentId) => {
    try {
        const response = await fetch(`${localhost}examQuestion/history/result/${studentId}${'/' + examId}`);
        return response;
    } catch (error) {

        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}

export { startExamApi, getAllExams, getExamById, getHistoryExam, submitExamV, checkExamApi }