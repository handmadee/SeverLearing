'use strict'

const historyExamModel = require("../models/historyExam.model");
const BaseService = require("../../services/base.service");




class HistoryExamRepositories extends BaseService {
    constructor() {
        super(historyExamModel)
    }
    async getAllHistory(query, select) {
        return await this.model.find(query)
            .select(select)
            .populate({
                path: 'userRef',
                select: 'fullname'
            }
            )
            .populate({
                path: 'examRef',
                select: '_id'
            }).sort({ createdAt: -1 })
    }
    async submitExam(payload) {

    }






}


module.exports = new HistoryExamRepositories();