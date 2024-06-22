'use strict';
const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'historyCourse';
const COLLECTION_NAME = 'historyCourses';

const shopSechema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'account' },
    courseID: { type: Schema.Types.ObjectId, ref: 'course' },
    learnLesson: [{ type: Schema.Types.ObjectId, ref: 'lessson' }],
    statusCourse: {
        type: String,
        enum: ['learning', 'finish'],
        default: 'learning'
    },
    progress: { type: Number, default: 0 },
    lastLessonCompleted: { type: Schema.Types.ObjectId, ref: 'lessson' },
    completedLessonsCount: { type: Number, default: 0 }
}, { timestamps: true, collection: COLLECTION_NAME });

// Export the model ff
module.exports = model(DOCUMENT_NAME, shopSechema);

