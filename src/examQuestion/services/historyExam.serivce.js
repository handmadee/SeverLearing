'use strict';

const StudentScheduleService = require('./../../services/schedule/schedule.service');
const historyExamRepository = require("../repositories/historyExam.repository");
const ExamQuestionServices = require("./exam.service");

class HistoryExamService {
    // static async createHistoryExam(payload) {
    //     const { examRef, userRef, answers } = payload;
    //     await StudentScheduleService.checkStudentExistenceById(userRef);
    //     const exam = await ExamQuestionServices.getExamById(examRef);
    //     const examSolution = exam.answers;
    //     console.log(answers.section1, examSolution.section1.questions)

    //     // Calculate scores for both sections
    //     const section1Results = this.calculateSection1Score(answers.section1, examSolution.section1);
    //     console.log(section1Results)
    //     const section2Results = this.calculateSection2Score(
    //         answers.section2.answers,
    //         examSolution.section2.questions,
    //         answers.section2.selectedGroup
    //     );
    //     console.log("====>")
    //     console.log(section1Results)
    //     // Combine results
    //     const totalScore = section1Results.score + section2Results.score;
    //     const result = totalScore >= 5.0;

    //     const historyExam = {
    //         examRef,
    //         userRef,
    //         sections: {
    //             section1: section1Results,
    //             section2: section2Results
    //         },
    //         totalScore,
    //         result,
    //         submittedAt: new Date()
    //     };
    //     console.log(historyExam);
    //     // return historyExamRepository.create(historyExam);
    // }

    // static calculateSection1Score(studentAnswers, correctAnswers) {
    //     let correctCount = 0;
    //     let incorrectAnswers = [];
    //     let correctAnswersList = [];
    //     console.log("======")
    //     console.log(studentAnswers, correctAnswers);

    //     console.log(correctAnswers.questions[3].correctAnswer)
    //     studentAnswers.forEach((answer, index) => {
    //         console.log(answer)
    //         if (answer === correctAnswers.questions[index].correctAnswer) {
    //             correctCount++;
    //             correctAnswersList.push({
    //                 index: index + 1,
    //                 answer: answer
    //             });
    //         } else {
    //             incorrectAnswers.push({
    //                 index: index + 1,
    //                 answer: answer,
    //                 correctAnswer: correctAnswers.questions[index].correctAnswer
    //             });
    //         }
    //     });
    //     console.log({
    //         score: correctCount * 0.25,
    //         correctAnswers: correctAnswersList,
    //         incorrectAnswers: incorrectAnswers,
    //         totalQuestions: studentAnswers.length
    //     })
    //     return {
    //         score: correctCount * 0.25,
    //         correctAnswers: correctAnswersList,
    //         incorrectAnswers: incorrectAnswers,
    //         totalQuestions: studentAnswers.length
    //     };
    // }


    // static calculateSection2Score(studentAnswers, correctAnswers, selectedGroup) {
    //     let totalScore = 0;
    //     let correctAnswersList = [];
    //     let incorrectAnswers = [];

    //     // Determine which questions to grade based on selected group
    //     const startIndex = selectedGroup === 'group1' ? 0 : 3;
    //     const relevantAnswers = correctAnswers.slice(startIndex, startIndex + 3);

    //     studentAnswers.forEach((questionAnswers, questionIndex) => {
    //         const actualQuestionIndex = startIndex + questionIndex;
    //         let correctCount = 0;
    //         let wrongAnswers = [];

    //         questionAnswers.forEach((answer, index) => {
    //             if (answer === relevantAnswers[questionIndex].correctAnswers[index]) {
    //                 correctCount++;
    //             } else {
    //                 wrongAnswers.push({
    //                     subQuestion: index + 1,
    //                     given: answer,
    //                     correct: relevantAnswers[questionIndex].correctAnswers[index]
    //                 });
    //             }
    //         });
    //         let questionScore = 0;
    //         switch (correctCount) {
    //             case 1: questionScore = 0.1; break;
    //             case 2: questionScore = 0.25; break;
    //             case 3: questionScore = 0.5; break;
    //             case 4: questionScore = 1.0; break;
    //             default: questionScore = 0; break;
    //         }

    //         totalScore += questionScore;

    //         if (correctCount === 4) {
    //             correctAnswersList.push({
    //                 questionIndex: actualQuestionIndex + 1,
    //                 answers: questionAnswers
    //             });
    //         } else {
    //             incorrectAnswers.push({
    //                 questionIndex: actualQuestionIndex + 1,
    //                 wrongAnswers,
    //                 score: questionScore
    //             });
    //         }
    //     });

    //     return {
    //         score: totalScore,
    //         correctAnswers: correctAnswersList,
    //         incorrectAnswers: incorrectAnswers,
    //         selectedGroup,
    //         totalQuestions: 3 // Number of questions in selected group
    //     };
    // }

    static async createHistoryExam(payload) {
        try {
            const { examRef, userRef, answers } = payload;
            // Validate student and get exam
            await StudentScheduleService.checkStudentExistenceById(userRef);
            const exam = await ExamQuestionServices.getExamById(examRef);

            // Calculate scores for each section
            const section1Results = this.calculateSection1Score(
                answers.section1,
                exam.answers.section1.questions
            );

            const section2Results = this.calculateSection2Results(
                answers.section2,
                exam.answers.section2
            );



            const totalScore = section1Results.score + section2Results.score;
            const result = totalScore >= 5.0;

            const historyExam = {
                examRef,
                userRef,
                sections: {
                    section1: section1Results,
                    section2: section2Results
                },
                totalScore,
                result,
                submittedAt: new Date()
            };
            return await historyExamRepository.create(historyExam);
        } catch (error) {
            console.error('Error in createHistoryExam:', error);
            throw error;
        }
    }

    static calculateSection1Score(studentAnswers, correctAnswers) {
        try {
            let correctCount = 0;
            let incorrectAnswers = [];
            let correctAnswersList = [];

            studentAnswers.forEach((answer, index) => {
                const question = correctAnswers[index];
                if (answer === question.correctAnswer) {
                    correctCount++;
                    correctAnswersList.push({
                        questionNumber: index + 1,
                        answer: answer
                    });
                } else {
                    incorrectAnswers.push({
                        questionNumber: index + 1,
                        studentAnswer: answer,
                        correctAnswer: question.correctAnswer
                    });
                }
            });

            // Each correct answer in section 1 is worth 0.25 points
            const score = correctCount * 0.25;

            return {
                score,
                correctAnswers: correctAnswersList,
                incorrectAnswers,
                totalQuestions: studentAnswers.length
            };
        } catch (error) {
            console.error('Error in calculateSection1Score:', error);
            throw error;
        }
    }

    static calculateSection2Results(studentSection2, examSection2) {
        try {
            // Calculate common questions score
            const commonResults = this.calculateCommonQuestionsScore(
                studentSection2.common,
                examSection2.common.questions
            );

            // Calculate specialized questions score
            const specializedResults = this.calculateSpecializedQuestionsScore(
                studentSection2.specialized,
                examSection2
            );

            return {
                score: commonResults.score + specializedResults.score,
                common: commonResults,
                specialized: specializedResults
            };
        } catch (error) {
            console.error('Error in calculateSection2Results:', error);
            throw error;
        }
    }

    static calculateCommonQuestionsScore(studentAnswers, correctAnswers) {
        let totalScore = 0;
        let correctAnswersList = [];
        let incorrectAnswers = [];

        studentAnswers.forEach((questionAnswers, questionIndex) => {
            let correctCount = 0;
            let wrongAnswers = [];

            questionAnswers.forEach((answer, index) => {
                if (answer === correctAnswers[questionIndex].correctAnswers[index]) {
                    correctCount++;
                } else {
                    wrongAnswers.push({
                        subQuestionNumber: index + 1,
                        studentAnswer: answer,
                        correctAnswer: correctAnswers[questionIndex].correctAnswers[index]
                    });
                }
            });

            // Score calculation for common questions
            let questionScore = this.calculateQuestionScore(correctCount);
            totalScore += questionScore;

            if (correctCount === 4) {
                correctAnswersList.push({
                    questionNumber: questionIndex + 1,
                    answers: questionAnswers
                });
            } else {
                incorrectAnswers.push({
                    questionNumber: questionIndex + 1,
                    wrongAnswers,
                    score: questionScore
                });
            }
        });

        return {
            score: totalScore,
            correctAnswers: correctAnswersList,
            incorrectAnswers,
            totalQuestions: studentAnswers.length
        };
    }

    static calculateSpecializedQuestionsScore(studentSpecialized, examSection2) {
        const type = studentSpecialized.type || "cs";
        const questions = examSection2.private[type].questions;

        let totalScore = 0;
        let correctAnswersList = [];
        let incorrectAnswers = [];

        studentSpecialized.answers.forEach((questionAnswers, questionIndex) => {
            let correctCount = 0;
            let wrongAnswers = [];

            questionAnswers.forEach((answer, index) => {
                if (answer === questions[questionIndex].correctAnswers[index]) {
                    correctCount++;
                } else {
                    wrongAnswers.push({
                        subQuestionNumber: index + 1,
                        studentAnswer: answer,
                        correctAnswer: questions[questionIndex].correctAnswers[index]
                    });
                }
            });

            // Score calculation for specialized questions
            let questionScore = this.calculateQuestionScore(correctCount);
            totalScore += questionScore;

            if (correctCount === 4) {
                correctAnswersList.push({
                    questionNumber: questionIndex + 1,
                    answers: questionAnswers
                });
            } else {
                incorrectAnswers.push({
                    questionNumber: questionIndex + 1,
                    wrongAnswers,
                    score: questionScore
                });
            }
        });

        return {
            type,
            score: totalScore,
            correctAnswers: correctAnswersList,
            incorrectAnswers,
            totalQuestions: studentSpecialized.answers.length
        };
    }

    static calculateQuestionScore(correctCount) {
        switch (correctCount) {
            case 4: return 1.0;
            case 3: return 0.5;
            case 2: return 0.25;
            case 1: return 0.1;
            default: return 0;
        }
    }


    static async getHistoryByExamId(id, status, q) {
        let query = {
            examRef: id
        };
        if (status) query.examIsActive = status;
        await ExamQuestionServices.foundExam(id);
        return await historyExamRepository.getAllHistory(query);
    }

    static async getResultExamByStudentId(studentId, examId) {
        await StudentScheduleService.checkStudentExistenceById(studentId);
        let query = {
            userRef: studentId
        };
        if (examId) {
            await ExamQuestionServices.foundExam(examId);
            query.examRef = examId;
        }
        return await historyExamRepository.getAllHistory(query);
    }

    static async removeBulkExamById(examIds) {
        if (!Array.isArray(examIds) || examIds.length === 0) {
            throw new Error("Invalid or empty exam IDs array.");
        }
        return await historyExamRepository.removeBulkByIds(examIds);
    }
}

module.exports = HistoryExamService;