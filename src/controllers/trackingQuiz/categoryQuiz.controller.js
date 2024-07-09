'use strict'

const e = require("express");
const { OK } = require("../../core/success.response");
const categoryQuizService = require("../../services/trakingQuiz/categoryQuiz.service");
const category = new categoryQuizService();

class CategoryQuizControler {
    // Create Category
    static async createCategory(req, res) {
        const imageCategory = req.file ? req.file.path : null;
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
        let updateData = { ...req.body };
        console.log(req.body)
        if (req.file) {
            const avatar = req.file.path;
            updateData.imageCategory = avatar;
        }
        return new OK({
            message: "Category updated successfully",
            data: await category.update(req.params.id, updateData)
        }).send(res);
    }
    static async removeCategory(req, res) {
        return new OK({
            message: "Category removed",
            data: await category.deleteCategoryQuiz(req.params.id)
        }).send(res);
    }
}

module.exports = CategoryQuizControler;