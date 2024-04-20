'use strict';

const { type } = require('express/lib/response');
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'chappter';
const COLLECTION_NAME = 'chappters';

const shopSechema = new Schema({
    titleChapter: {
        type: String,
        trim: true,
        maxLength: 150
    },
    courseId: { type: Schema.Types.ObjectId, ref: 'course' },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'lessson' }],
    exams: [{ type: Schema.Types.ObjectId, ref: 'exam' }]
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);