'use strict';

const { model, Schema, Types } = require('mongoose');

// Standardized document and collection names
const DOCUMENT_NAME = 'HistoryExamQuestion';
const COLLECTION_NAME = 'history_exam_questions';

const historyExamQuestionSchema = new Schema({
    examRef: {
        type: String,
        ref: 'examQuestion',
        index: true,
        required: true
    },
    userRef: {
        type: Schema.Types.ObjectId,
        ref: 'studentShechedule',
        index: true,
        required: true
    },
    correctAnswers: {
        type: Number,
        min: 0,
        required: true,
        default: 0
    },
    incorrectAnswers: {
        type: Number,
        min: 0,
        required: true,
        default: 0
    },
    result: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});
historyExamQuestionSchema.index({ result: 1 });


module.exports = model(DOCUMENT_NAME, historyExamQuestionSchema);
