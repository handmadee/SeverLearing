'use strict';

const { model, Schema, Types } = require('mongoose');
const reader = require('xlsx');

const DOCUMENT_NAME = 'FeedBack';
const COLLECTION_NAME = 'feedbacks';

// Language IDs for reference


const feedBackSchema = new Schema({
    teacherAccount: {
        type: Types.ObjectId,
        ref: 'account',
        required: true
    },
    studentsAccount: {
        type: Types.ObjectId,
        ref: 'studentShechedule',
        required: true
    },
    subjectScores: {
        type: [{
            languageIt: { type: Types.ObjectId, ref: 'LanguageIt' },
            level: { type: String, require: false },
            score: { type: Number, required: true },
        }],
        required: true
    },
    skill: {
        type: String,
        enum: ['good', 'rather', 'medium'],
    },
    thinking: {
        type: String,
        enum: ['good', 'rather', 'medium'],
    },
    contentFeedBack: {
        type: String,
        trim: true
    },
    // List theo toppic 
    //  1 là đã học, 0 là chưa học, và 2 là đang học
    learningStatus: {
        type: [{
            topic: { type: Types.ObjectId, ref: 'topic' },
            status: { type: Number, required: true, enum: [0, 1, 2] }, // 0: chưa học, 1: đã học, 2: đang học 
        }],
        required: true
    },

}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, feedBackSchema);
