'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'shop';
const COLLECTION_NAME = 'shops';

const shopSechema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);