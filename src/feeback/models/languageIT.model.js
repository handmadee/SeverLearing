'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'LanguageIt';
const COLLECTION_NAME = 'languageIts';

const LanguageItModel = new Schema({
    nameCode: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    describe: {
        type: String,
        trim: true,
    }
}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, LanguageItModel);
