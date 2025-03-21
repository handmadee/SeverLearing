'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'studentShechedule';
const COLLECTION_NAME = 'studentShechedules';

const studentShecheduleQuizSchema = new Schema({
    fullname: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        maxLength: 100,
        required: true
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

}, { timestamps: true, collection: COLLECTION_NAME });

// @prams 
studentShecheduleQuizSchema.index({ fullname: 'text' })
studentShecheduleQuizSchema.pre('findByIdAndDelete', async function (next) {
    try {
        const studentId = this._id;
        await mongoose.model('HistoryExamQuestion').deleteMany({ userRef: studentId });
        next();
    } catch (error) {
        next(error);
    }
});
module.exports = model(DOCUMENT_NAME, studentShecheduleQuizSchema);