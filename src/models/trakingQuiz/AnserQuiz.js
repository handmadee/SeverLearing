// answers model 
'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'AnswerQuiz';
const COLLECTION_NAME = 'answerQuizzes';

const answerQuizSchema = new Schema({
    titleAnswer: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    question_id: { type: Schema.Types.ObjectId, ref: 'QuestionQuiz' }
}, { timestamps: false, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, answerQuizSchema);

// Sử dụng refences trong mongoose