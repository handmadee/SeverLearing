'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'examQuestion';
const COLLECTION_NAME = 'examQuestions';

const examQuestionSchema = new Schema({
    title: {
        type: String,
        index: true,
        default: ""
    },
    linkTopic: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^https?:\/\/[^\s]+$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    answers: {
        section1: {
            questions: [{
                id: {
                    type: Number,
                    required: true
                },
                correctAnswer: {
                    type: String,
                    required: true
                }
            }]
        },
        section2: {
            common: {
                questions: [{
                    id: {
                        type: Number,
                        required: true
                    },
                    correctAnswers: {
                        type: [String],
                        required: true
                    }
                }]
            },
            private: {
                cs: {
                    questions: [{
                        id: {
                            type: Number,
                            required: true
                        },
                        correctAnswers: {
                            type: [String],
                            required: true
                        }
                    }]
                },
                itc: {
                    questions: [{
                        id: {
                            type: Number,
                            required: true
                        },
                        correctAnswers: {
                            type: [String],
                            required: true
                        }
                    }]
                },
            }

        }
    },
    expTime: {
        type: Number,
        min: 0,
        required: true,
    },
    limitUser: {
        type: Number,
        min: 0,
        default: 1
    },
    countUsed: {
        type: Number,
        min: 0,
        default: 0
    },
    examStudentUsed: {
        type: [Schema.Types.ObjectId],
        ref: 'studentShechedules',
        default: []
    },
    applyStudentIds: {
        type: [Schema.Types.ObjectId],
        ref: 'studentShechedules',
        default: []
    },
    examIsActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});
examQuestionSchema.index({ title: 'text' })
examQuestionSchema.pre('remove', async function (next) {
    await mongoose.model('HistoryExamQuestion').deleteMany({ examRef: this._id });
    next();
});


module.exports = model(DOCUMENT_NAME, examQuestionSchema);
