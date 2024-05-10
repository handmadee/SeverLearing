
'use strict';


const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Quiz';
const COLLECTION_NAME = 'Quizzes';

const quizSchema = new Schema({
    title: {
        type: String,
        trim: true,
        maxLength: 150
    },
    time: {
        type: Number,
        trim: true,
        default: 15
    },
    level: {
        type: 'String',
        enum: [111, 112, 113],
        default: 111
    },
    points: {
        type: Number,
        default: 10
    },
    categoryQuiz_id: { type: Types.ObjectId, ref: 'CategoryQuiz' },
    questionQuiz: [{ type: Schema.Types.ObjectId, ref: 'QuestionQuiz' }],

}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, quizSchema);