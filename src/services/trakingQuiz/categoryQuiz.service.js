'use strict';



const { CategoryQuiz } = require('../../models/trakingQuiz/categoryQuiz');
const QuizModel = require('../../models/trakingQuiz/Quiz');

const BaseService = require('../base.service');

class categoryQuizService extends BaseService {
    constructor() {
        super(CategoryQuiz);
    }
    async getCategoryFull() {
        return await this.model.find().select('nameCategory').lean();
    }
    async getCategoryQuizById(id) {
        return await this.model.findById(id).populate({
            path: "quizes",
            select: "nameCategory title  time  level "
        });
    }

    // Delete 1 category -> delete quiz 
    async deleteCategoryQuiz(_id) {
        try {
            await Promise.all([
                this.model.findByIdAndDelete(_id).exec(),
                QuizModel.deleteMany({
                    categoryQuiz_id: _id
                }).exec(),
            ]);
            console.log(`Course with ID ${_id} and related categories and chapters deleted successfully.`);
            return true;
        } catch (error) {
            console.error(`Error deleting course with ID ${_id}:`, error);
            throw error;
        }
    }
}


module.exports = categoryQuizService;