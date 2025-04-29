'use strict';

const topicModel = require('../../models/topic.model');
const studentTopicModel = require('../../models/studentTopic.model');
const { BadRequestError } = require('../../core/error.response');
const { convertExcelToFeedbackJson } = require('../../untils/xlsx');


class TopicService {
    static async createTopic(topicData) {
        return await topicModel.create(topicData);
    }
    static async getTopics(filter = {}) {
        try {
            const topics = await topicModel.find({ isActive: true, ...filter }).sort({ level: 1, order: 1 });
            return topics;
        } catch (error) {
            console.log(error);
            throw new BadRequestError('Error fetching topics');
        }
    }

    static async getTopicsByLevel(level) {
        return await topicModel.find({ level, isActive: true }).sort({ order: 1 });
    }

    static async getTopicsByLanguage(language) {
        return await topicModel.find({ language, isActive: true }).sort({ level: 1, order: 1 });
    }

    static async getTopicById(topicId) {
        return await topicModel.findById(topicId);
    }

    static async updateTopic(topicId, updateData) {
        return await topicModel.findByIdAndUpdate(topicId, updateData, { new: true });
    }

    static async deleteTopic(topicId) {
        return await topicModel.findByIdAndUpdate(topicId, { isActive: false }, { new: true });
    }

    // Student Topic related methods
    static async updateStudentTopicStatus(studentId, topicData) {
        const { name, level, language, status } = topicData;

        if (!name || !level || !language || !status) {
            throw new BadRequestError('Missing required fields');
        }

        const filter = {
            student: studentId,
            name,
            level,
            language
        };

        const update = {
            ...topicData,
            ...(status === 'completed' ? { completedDate: new Date() } : {})
        };

        return await studentTopicModel.findOneAndUpdate(
            filter,
            update,
            { new: true, upsert: true }
        );
    }

    static async getStudentTopics(studentId) {
        try {
            console.log(studentId);
            console.log("Đã vào đây");
            const studentTopics = await studentTopicModel.find({ student: studentId }).sort({ level: 1, order: 1 });
            console.log(studentTopics);
            return studentTopics;
        } catch (error) {
            console.log(error);
            throw new BadRequestError('Error fetching student topics');
        }
    }

    static async bulkCreateStudentTopics(studentId, topics) {
        const studentTopics = topics.map(topic => ({
            student: studentId,
            name: topic.name,
            level: topic.level,
            order: topic.order,
            language: topic.language,
            status: 'not_started'
        }));

        return await studentTopicModel.insertMany(studentTopics, { ordered: false });
    }
}

module.exports = TopicService; 