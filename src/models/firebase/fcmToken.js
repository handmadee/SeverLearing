'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'fcmToken';
const COLLECTION_NAME = 'fcmTokens';

const fcmTokenSchema = new Schema({
    fcmToken: {
        type: String,
        trim: true,
        required: true,
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'account'
    }
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, fcmTokenSchema);