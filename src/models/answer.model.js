// answers model 
'use strict';

const { model, Schema, Types } = require('mongoose');
const DOCUMENT_NAME = 'answer';
const COLLECTION_NAME = 'answers';
const answerSechema = new Schema({
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
    question_id: { type: Schema.Types.ObjectId, ref: 'Question' }
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, answerSechema);

// Sử dụng refences trong mongoose