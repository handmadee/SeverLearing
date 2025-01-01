'use strict'


const BaseService = require("../../services/base.service");
const { generateCustomId } = require("../../untils/string.untils");
const examQuestionModel = require("../models/examQuestion.model");
const historyExamModel = require("../models/historyExam.model");



class ExamRepositories extends BaseService {
    constructor() {
        super(examQuestionModel)
    }
    // status -> true/ false
    async getAllExam(status, select, page = 1, limit = 20, q) {
        let query = {};
        if (status) {
            query.examIsActive = status;
        }
        if (q) {
            query.$or = [
                { _id: { $regex: q, $options: 'i' } },
                { title: { $regex: q, $options: 'i' } }
            ];
        }
        const total = await this.model.countDocuments(query);
        const skip = (page - 1) * limit;
        const exams = await this.model
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select(select);
        const totalPages = Math.ceil(total / limit);
        return {
            exams,
            currentPage: page,
            totalPages,
            totalExams: total
        };
    }


    async createdExam(payload) {
        const _id = generateCustomId();
        console.log({
            _id,
            type: typeof (_id)
        })
        try {
            return await this.create({
                ...payload,
                _id
            })
        } catch (error) {
            console.log({
                error
            })
            throw new Error(error);
        }
    }

    async examExistsById(id) {
        const exists = await this.model.exists({ _id: id });
        return !!exists;
    }

    async getExamById(id, select) {
        return await this.model.findOne({
            _id: id
        }).select(select);
    }

    async removeExamById(id) {
        return await this.model.deleteOne({
            _id: id
        })
    }

    async updateExamById(id, newPayload) {
        return await this.model.updateOne({
            _id: id
        }, newPayload);
    }

    async searchExamByTitle(searchKeyword, select) {
        return await this.model.find({ $text: { $search: searchKeyword } }).select(select).lean()
    }
}

module.exports = new ExamRepositories();