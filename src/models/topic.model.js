'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'topic';
const COLLECTION_NAME = 'topics';

const topicSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: Number,
        required: true,
        default: 1
    },
    order: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['Python', 'C++', 'Scratch']
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model
module.exports = model(DOCUMENT_NAME, topicSchema); 