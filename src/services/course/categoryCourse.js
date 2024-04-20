'use strict';

const BaseService = require('../base.service');
const CategoryCourse = require('./../../models/category.model');


class categoryService extends BaseService {
    constructor() {
        super(CategoryCourse);
    }
    async getCategoryFull() {
        return await this.model.find({}).populate('courses');
    }
    async getCategoryById(id) {
        return await this.model.findById(id).populate('courses').select('_id title detailCourse imageCourse');
    }
}

module.exports = categoryService;