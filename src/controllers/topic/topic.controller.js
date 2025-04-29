'use strict';

const { OK, CREATED } = require('../../core/success.response');
const TopicService = require('../../services/topic/topic.service');
const { asyncHandler } = require('../../helpers/asyncHandler');

class TopicController {
    // Topic API endpoints
    getTopics = async (req, res) => {
        const topics = await TopicService.getTopics();
        return new OK({
            message: 'Get topics successfully',
            data: topics
        }).send(res)
    };

    getTopicsByLevel = asyncHandler(async (req, res) => {
        const { level } = req.params;
        const topics = await TopicService.getTopicsByLevel(level);
        return new OK({
            message: 'Get topics by level successfully',
            data: topics
        }).send(res);
    });

    getTopicsByLanguage = asyncHandler(async (req, res) => {
        const { language } = req.params;
        const topics = await TopicService.getTopicsByLanguage(language);
        return new OK({
            message: 'Get topics by language successfully',
            data: topics
        }).send(res);
    });

    createTopic = asyncHandler(async (req, res) => {
        const result = await TopicService.createTopic(req.body);
        return new CREATED({
            message: 'Create topic successfully',
            data: result
        }).send(res);
    });

    updateTopic = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await TopicService.updateTopic(id, req.body);
        return new OK({
            message: 'Update topic successfully',
            data: result
        }).send(res);
    });

    deleteTopic = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await TopicService.deleteTopic(id);
        return new OK({
            message: 'Delete topic successfully',
            data: result
        }).send(res);
    });

    // Student Topic API endpoints
    getStudentTopics = asyncHandler(async (req, res) => {
        const { id } = req.params;
        console.log(id);
        const topics = await TopicService.getStudentTopics(id);
        return new OK({
            message: 'Get student topics successfully',
            data: topics
        }).send(res);
    });

    updateStudentTopicStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await TopicService.updateStudentTopicStatus(id, req.body);
        return new OK({
            message: 'Update student topic status successfully',
            data: result
        }).send(res);
    });

    bulkCreateStudentTopics = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { topics } = req.body;
        const result = await TopicService.bulkCreateStudentTopics(id, topics);
        return new CREATED({
            message: 'Create student topics successfully',
            data: result
        }).send(res);
    });
}

module.exports = new TopicController(); 