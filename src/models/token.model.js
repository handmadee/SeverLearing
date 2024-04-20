'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Token';
const COLLECTION_NAME = 'tokens';

const tokenSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        required: true,
        index: true
    },
    access_token: {
        type: String,
        required: true,
        trim: true
    },
    refresh_token: {
        type: String,
        required: true,
        trim: true
    },
    expired_at: {
        type: Date,
        default: Date.now() + 7 * 24 * 60 * 60 * 1000
    },
}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, tokenSchema);