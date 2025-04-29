const express = require('express');
const topicController = require('../../controllers/topic/topic.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const permission = require('../../auth/permissionApi');

const router = express.Router();

// Topic routes
router.get('/topics', asyncHandler(topicController.getTopics));
router.get('/topics/level/:level', asyncHandler(topicController.getTopicsByLevel));
router.get('/topics/language/:language', asyncHandler(topicController.getTopicsByLanguage));
router.post('/topics', permission('999'), asyncHandler(topicController.createTopic));
router.put('/topics/:id', permission('999'), asyncHandler(topicController.updateTopic));
router.delete('/topics/:id', permission('999'), asyncHandler(topicController.deleteTopic));

// Student Topic routes
router.get('/student-topics/:id', asyncHandler(topicController.getStudentTopics));
router.post('/student-topics/:id', permission('999'), asyncHandler(topicController.bulkCreateStudentTopics));
router.put('/student-topics/:id', permission('999'), asyncHandler(topicController.updateStudentTopicStatus));

module.exports = router; 