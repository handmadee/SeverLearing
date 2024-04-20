// answers model 
'use strict';

const { type } = require('express/lib/response');
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'answer';
const COLLECTION_NAME = 'answers';

const shopSechema = new Schema({
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
module.exports = model(DOCUMENT_NAME, shopSechema);

// Sử dụng refences trong mongoose