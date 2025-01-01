'use strict';

import { LOCALHOST_API_URL } from "../../../config.js";

const localhost = LOCALHOST_API_URL;


// title linkTopic answers expTime limitUser-> mặc định là 1 
const createdExamApi = async ({
    title,
    linkTopic,
    answers,
    expTime,
    limitUser = 1
}) => {
    try {
        return await fetch(`${localhost}examQuestion`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    linkTopic,
                    answers,
                    expTime,
                    limitUser
                })
            }
        )
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}

const deleteExamApi = async (idExam) => {
    try {
        const res = await fetch(`${localhost}examQuestion/${idExam}`,
            {
                method: 'DELETE'
            }
        );
        return res;
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}

const updateExamApi = async (idExam, body) => {
    try {
        const res = await fetch(`${localhost}examQuestion/${idExam}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );
        return await res.json();
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}

const getAllExams = async ({
    page = 1,
    limit = 20,
    status = '',
    search = ''
} = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (status) {
            params.append('status', status);
        }
        if (search) {
            params.append('q', search);
        }

        const response = await fetch(`${localhost}examQuestion?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data;

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đề thi:', error);
        throw new Error('Không thể lấy danh sách đề thi. Vui lòng thử lại sau!');
    }
};

const changeStatusExam = async (examId) => {
    try {
        const res = await fetch(`${localhost}examQuestion/change/${examId}`,
            {
                method: 'PATCH',
            }
        );
        console.log(res);
        const data = await res.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
        alert('Đã xảy ra lỗi !');
    }
}


const getHistoryByExamId = async (idExam) => {
    try {
        const response = await fetch(`${localhost}examQuestion/history/exam/${idExam}`);
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







export { getAllExams, createdExamApi, changeStatusExam, getHistoryByExamId, updateExamApi, deleteExamApi }