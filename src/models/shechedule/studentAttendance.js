'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'studentAttendance';
const COLLECTION_NAME = 'studentAttendances';

const studentShecheduleQuizSchema = new Schema({
    studentAccount: {
        type: Types.ObjectId, ref: 'studentShechedule'
    },
    teacherAccount: {
        type: Types.ObjectId, ref: 'account'
    },
    attendance: {
        type: Boolean,
        default: false,
        required: true
    },
    study: {
        type: Number,
        trim: true,
        required: true
    },
    reason: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: true
    }

}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, studentShecheduleQuizSchema);