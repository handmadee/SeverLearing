'use strict'

const { type } = require('express/lib/response');
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'feedBack';
const COLLECTION_NAME = 'feedbacks';

const feedBackModel = new Schema({
    teacherAccount: {
        type: Types.ObjectId, ref: 'account'
        , required: true
    },
    studentsAccount: {
        type: Types.ObjectId, ref: 'studentShechedule'
        , required: true
    },
    contentFeedBack: {
        type: String,
        trim: true
    }
}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, feedBackModel);