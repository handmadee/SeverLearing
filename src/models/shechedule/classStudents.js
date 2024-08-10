'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Class';
const COLLECTION_NAME = 'class';

const ClassModel = new Schema({
    nameClass: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    teacherAccount: {
        type: Types.ObjectId, ref: 'account'
        , required: true
    },
    study: {
        type: Number,
        trim: true,
        required: true
    },
    days: {
        type: [Number],
        trim: true,
        enum: [2, 3, 4, 5, 6, 7, 8],
        required: true
    },
    studentsAccount: {
        type: [Types.ObjectId], ref: 'studentShechedule',
    }




}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, ClassModel);