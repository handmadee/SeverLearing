'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'FeedBack';
const COLLECTION_NAME = 'feedbacks';

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
    }
}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, feedBackSchema);
