'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'CategoryQuiz';
const COLLECTION_NAME = 'categoryQuizzes';

const categoryQuizSchema = new Schema({
    nameCategory: {
        type: String,
        trim: true,
        maxLength: 100,
        required: true
    },
    quizes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }]
}, { timestamps: true, collection: COLLECTION_NAME });

exports.CategoryQuiz = model(DOCUMENT_NAME, categoryQuizSchema);