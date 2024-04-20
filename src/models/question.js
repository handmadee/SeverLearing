// question model 

'use strict';

const { type } = require('express/lib/response');
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'question';
const COLLECTION_NAME = 'questions';

const shopSechema = new Schema({
    question: {
        type: String,
        trim: true,
        maxLength: 150
    },
    exam_id: { type: Types.ObjectId, ref: 'Exam' },
    answers: [{ type: Schema.Types.ObjectId, ref: 'answer' }]

}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);