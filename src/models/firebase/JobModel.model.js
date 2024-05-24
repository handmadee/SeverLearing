'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'jobNotification';
const COLLECTION_NAME = 'jobNotifications';

const jobNotificationSchema = new Schema({
    jobId: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    data: {
        type: Schema.Types.Mixed
        , required: true
    },
    date: {
        type: Date,
        required: true,
    },

}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, jobNotificationSchema);