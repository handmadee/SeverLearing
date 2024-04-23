// Theo dõi tiến độ quiz của user

'use strict';
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'trakingQuiz';
const COLLECTION_NAME = 'trakingQuizs';

const trackingQuizSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'account' },
    quizID: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    Score: {
        type: Number,
        default: 0
    },
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, trackingQuizSchema);

