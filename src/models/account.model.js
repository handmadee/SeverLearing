'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'account';
const COLLECTION_NAME = 'accounts';

const userSechema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    info: {
        type: Schema.Types.ObjectId,
        ref: 'infoUser'
    },
    pemission: {
        type: [String],
        enum: ['001', '888', '789', '999'],
        default: ['001']
    },


}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, userSechema);