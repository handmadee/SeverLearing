'use strict';

const { type } = require('express/lib/response');
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
    sections: {
        section1: {
            score: {
                type: Number
            },
            correctAnswers: {
                type: Array,
            },
            incorrectAnswers: {
                type: Array,
            },
            totalQuestions: {
                type: Number,
            },
        },
        section2: {
            score: {
                type: Number
            },
            common: {
                score: {
                    type: Number
                },
                correctAnswers: {
                    type: Array,
                },
                incorrectAnswers: {
                    type: Array,
                },
                totalQuestions: {
                    type: Number,
                },
            },
            specialized: {
                score: {
                    type: Number
                },
                correctAnswers: {
                    type: Array,
                },
                incorrectAnswers: {
                    type: Array,
                },
                totalQuestions: {
                    type: Number,
                },
            }
        }
    },
    totalScore: {
        type: Number,
        required: true,
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
