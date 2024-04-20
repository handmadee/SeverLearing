'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'infoUser';
const COLLECTION_NAME = 'infoUsers';

const userSechema = new Schema({
    avatar: {
        type: String,
        trim: true
    },
    fullname: {
        type: String,
        trim: true,
        maxLength: 150
    },
    email: {
        type: String,
        trim: true,
        maxLength: 150
    },
    phone: {
        type: String,
        trim: true,
        maxLength: 150
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'account'
    }
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, userSechema);