'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'category';
const COLLECTION_NAME = 'categorys';

const shopSechema = new Schema({
    nameCategory: {
        type: String,
        trim: true,
        maxLength: 100,
        required: true
    },
    courses: [{ type: Schema.Types.ObjectId, ref: 'course' }]
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff≈
module.exports = model(DOCUMENT_NAME, shopSechema); 