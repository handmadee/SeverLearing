'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'studentTopic';
const COLLECTION_NAME = 'studentTopics';

const studentTopicSchema = new Schema({
    student: {
        type: String,
        ref: 'infor',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true,
        default: 1
    },
    order: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['Python', 'C++', 'Scratch']
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    completedDate: {
        type: Date
    }
}, { timestamps: true, collection: COLLECTION_NAME });
studentTopicSchema.index({ student: 1, name: 1, level: 1, language: 1 }, { unique: true });
module.exports = model(DOCUMENT_NAME, studentTopicSchema); 