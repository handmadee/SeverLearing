'use strict'

const e = require("express");
const { OK } = require("../../core/success.response");
const categoryQuizService = require("../../services/trakingQuiz/categoryQuiz.service");
const category = new categoryQuizService();

class CategoryQuizControler {
    // Create Category
    static async createCategory(req, res) {
        const file = req.file ? req.file.filename : null;
        const imageCategory = file ? `${process.env.LOCAL_HOST2}/uploads/${file}` : null;
        return new OK({
            message: "Category created successfully",
            data: await category.create({
                ...req.body,
                imageCategory
            })
        }).send(res);
    }
    static async getCategory(req, res) {
        return new OK({
            message: "Category found successfully",
            data: await category.getAll()
        }).send(res);
    }
    static async getCategoryById(req, res) {
        return new OK({
            message: "Category found successfully",
            data: await category.getCategoryQuizById(req.params.id)
        }).send(res);
    }
    static async updateCategory(req, res) {
        const file = req.file ? req.file.filename : null;
        const imageCategory = file ? `${process.env.LOCAL_HOST2}/uploads/${file}` : null;
        return new OK({
            message: "Category updated successfully",
            data: await category.update(req.params.id, {
                ...req.body,
                imageCategory
            })
        }).send(res);
    }
    static async removeCategory(req, res) {
        return new OK({
            message: "Category removed",
            data: await category.remove(req.params.id)
        }).send(res);
    }
}

module.exports = CategoryQuizControler;