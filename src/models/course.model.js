'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'course';
const COLLECTION_NAME = 'courses';
const shopSechema = new Schema({
    title: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    detailCourse: {
        type: String,
        trim: true,
        required: true
    },
    imageCourse: {
        type: String,
        trim: true,
        required: true
    },
    totalLesson: {
        type: Number,
        trim: true,
        default: 0
    },
    chapters: [{ type: Schema.Types.ObjectId, ref: 'chappter' }],
    category_id: { type: Schema.Types.ObjectId, ref: 'category' },
}, { timestamps: true, collection: COLLECTION_NAME });
// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);