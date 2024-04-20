'use strict';

const { OK } = require("../../core/success.response");
const QuestionService = require("./../../services/course/question.service");
const questionService = new QuestionService();

const AnswerService = require("../../services/course/answer.services");
const answerService = new AnswerService();

class QuestionAnswerController {
static async createQuestionWithAnswers(req, res) {
try {
// Tạo câu hỏi
const question = await questionService.createQuestion(req.body.question);

            // Tạo các câu trả lời
            const answers = [];
            for (const answer of req.body.answers) {
                const newAnswer = await answerService.createAnswer({ content: answer.content, is_correct: answer.is_correct });
                answers.push(newAnswer);
            }

            // Cập nhật câu hỏi với các câu trả lời tương ứng
            await questionService.updateQuestionWithAnswers(question._id, answers.map(answer => answer._id));

            return new OK({
                message: "Question and answers created successfully",
                data: { question, answers }
            }).send(res);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}

module.exports = QuestionAnswerController;
