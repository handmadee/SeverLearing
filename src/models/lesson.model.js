'use strict';

const { type } = require('express/lib/response');
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'lessson';
const COLLECTION_NAME = 'lessons';
const shopSechema = new Schema({
    titleLesson: {
        type: String,
        trim: true,
        maxLength: 150
    },
    timeLesson: {
        type: Number,
        trim: true,
        default: 15
    },
    urlVideo: {
        type: String,
        trim: true,
        maxLength: 150
    },
    chaptter_id: { type: Types.ObjectId, ref: 'chappter' },
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);