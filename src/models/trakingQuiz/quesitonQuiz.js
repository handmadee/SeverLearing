
'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'QuestionQuiz';
const COLLECTION_NAME = 'questionQuizzes';

const questionQuizSchema = new Schema({
    title: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    imageQuestion: {
        type: String,
        trim: true,
        default: null
    },
    mark: {
        type: Number,
        trim: true,
        default: 1
    },
    answer: [{ type: Schema.Types.ObjectId, ref: 'AnswerQuiz' }],
    quiz: { type: Types.ObjectId, ref: 'Quiz' },

}, { timestamps: false, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, questionQuizSchema);