// Model Exaxam for exam collection

'use strict';

const { type } = require('express/lib/response');
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'exam';
const COLLECTION_NAME = 'exams';

const shopSechema = new Schema({
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
    chaptter_id: { type: Types.ObjectId, ref: 'chappter' },
    question: [{ type: Schema.Types.ObjectId, ref: 'question' }],

}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);