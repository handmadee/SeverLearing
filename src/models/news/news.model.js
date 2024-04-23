// Base news model
'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'News';
const COLLECTION_NAME = 'Newss';

const newsShechema = new Schema({
    contentNews: {
        type: String,
        trim: true,
        required: true
    },
    imagePost: {
        type: String,
        trim: true,
    },

}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model 
module.exports = model(DOCUMENT_NAME, newsShechema);  