'use strict'

const e = require("express");
const { OK } = require("../../core/success.response");
const categoryService = require("../../services/course/categoryCourse")
const category = new categoryService();

class categoryControler {
    static async createCategory(req, res) {
        return new OK({
            message: "Category created successfully",
            data: await category.create(req.body)
        }).send(res);
    }
    static async getCategory(req, res) {
        return new OK({
            message: "Category found successfully",
            data: await category.getCategoryFull()
        }).send(res);
    }
    static async getCategoryById(req, res) {
        return new OK({
            message: "Category found successfully",
            data: await category.getCategoryById(req.params.id)
        }).send(res);
    }
    static async updateCategory(req, res) {
        return new OK({
            message: "Category updated successfully",
            data: await category.update(req.params.id, req.body)
        }).send(res);
    }
    static async removeCategory(req, res) {
        return new OK({
            message: "Category removed",
            data: await category.remove(req.params.id)
        }).send(res);
    }
}

module.exports = categoryControler;