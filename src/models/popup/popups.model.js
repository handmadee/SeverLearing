// popups.model.js
'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'popup';
const COLLECTION_NAME = 'popups';

const PopupSchema = new Schema({
    popupImage: {
        type: String,
        trim: true,
        required: true
    },
}, { timestamps: true, collection: COLLECTION_NAME });

module.exports = model(DOCUMENT_NAME, PopupSchema);
