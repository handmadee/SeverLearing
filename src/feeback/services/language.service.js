'use strict';

const BaseService = require('../../services/base.service');
const languageITModel = require('../models/languageIT.model');


class LanguageItService extends BaseService {
    constructor() {
        super(languageITModel);
    }

    async create(data) {
        const existing = await this.model.findOne({ nameCode: data.nameCode }).lean();
        if (existing) {
            throw new Error(`Language with nameCode "${data.nameCode}" already exists`);
        }
        return super.create(data);
    }

    async findById(id) {
        const item = await this.model.findById(id).lean();
        if (!item) throw new Error(`Item with ID ${id} not found`);
        return item;
    }

    async getAll() {
        return await this.model.find().sort({ createdAt: -1 }).lean();
    }
    async remove(id) {
        const item = await this.model.findByIdAndDelete(id);
        if (!item) throw new Error(`Item with ID ${id} not found`);
        return item;
    }
    async update(id, data) {
        const item = await this.model.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!item) throw new Error(`Item with ID ${id} not found`);
        return item;
    }
}

module.exports = new LanguageItService();
