'use strict'

const { Types } = require("mongoose");
const { BadRequestError } = require("../../core/error.response");
const classStudents = require("../../models/shechedule/classStudents");
const studentShecheduleModel = require("../../models/shechedule/studentShechedule.model");
const accountModel = require("../../models/account.model");

class ClassService {
    static async addStudents({
        idClass, idStudents
    }) {
        const foundClass = await classStudents.findById(
            idClass
        ).lean();
        if (!foundClass) throw new BadRequestError('CLASS NOT FOUND');
        const foundStudents = await studentShecheduleModel.findById(idStudents).lean();
        if (!foundStudents) throw new BadRequestError('Studetns NOT FOUND');
        const update = await classStudents.updateOne({
            _id: new Types.ObjectId(idClass)
        },
            {
                $addToSet: { studentsAccount: new Types.ObjectId(idStudents) }
            },
            {
                new: true
            }
        )
        return update;
    }



    static async removeStudents({
        idClass, idStudents
    }) {
        const foundClass = await classStudents.findById(
            idClass
        ).lean();
        if (!foundClass) throw new BadRequestError('CLASS NOT FOUND');
        const foundStudents = await studentShecheduleModel.findById(idStudents).lean();
        if (!foundStudents) throw new BadRequestError('Studetns NOT FOUND');
        const update = await classStudents.updateOne({
            _id: new Types.ObjectId(idClass)
        },
            {
                $pull: { studentsAccount: new Types.ObjectId(idStudents) }
            },
            {
                new: true
            }
        )
        return update;
    }
    static async createClass({
        nameClass, teacherAccount, study, days, studentsAccount = []
    }) {
        // const foundteacherAccount = await accountModel.findById(teacherAccount).lean();
        // if (!foundteacherAccount) throw new BadRequestError('teacherAccount NOT FOUND');
        const foundClass = await classStudents.findOne({
            nameClass: nameClass
        }).lean();
        if (foundClass) throw new BadRequestError('nameClass Exits !!!!!');
        return await classStudents.create({
            nameClass,
            teacherAccount: teacherAccount,
            days,
            study,
            studentsAccount: studentsAccount
        });

        // search 



    }
    // remove Class 
    static async removeClass({ idClass }) {
        return await classStudents.findOneAndDelete({
            _id: new Types.ObjectId(idClass)
        })
    }
    // update Class
    static async updateClass({ idClass, payload }) {
        // const { nameClass } = payload;
        // const respon = await classStudents.findOne({
        //     nameClass
        // }).lean();
        // if (respon) throw new BadRequestError("Name class is Exits")
        return await classStudents.findByIdAndUpdate(idClass, payload, { new: true })
    }

    // Get Study and Days and ID Teacher 
    static async getScheducleClass({
        study, day
    }) {
        const foundClass = await classStudents.find({
            study,
            days: { $in: [day] }
        }).populate({
            path: 'studentsAccount',
            select: '_id fullname study days phone'
        })
            .populate({
                path: 'teacherAccount',
                select: 'username'
            })
            .select('nameClass teacherAccount').lean();
        if (!foundClass) throw new BadRequestError('CLASS NOT FOUND');
        return foundClass
    }

    static async getScheducleClassByTeacher({
        study, day, idTeacher
    }) {
        const foundTeacher = await accountModel.findById(idTeacher).lean();
        if (!foundTeacher) throw new BadRequestError('foundTeacher NOT FOUND');
        const foundClass = await classStudents.find({
            study,
            teacherAccount: { $in: new Types.ObjectId(idTeacher) },
            days: { $in: [day] }
        }).populate({
            path: 'studentsAccount',
            select: '_id fullname study days phone'
        })
            .populate({
                path: 'teacherAccount',
                select: 'username'
            })
            .select('nameClass teacherAccount').lean();
        if (!foundClass) throw new BadRequestError('CLASS NOT FOUND');
        return foundClass
    }


    static async getTeachetClass({ study, idTeacher }) {
        const foundTeacher = await accountModel.findById(idTeacher).lean();
        if (!foundTeacher) throw new BadRequestError('foundTeacher NOT FOUND');
        // 
        const foundClass = await classStudents.findOne({
            study,
            teacherAccount: { $in: idTeacher }
        }).lean();
        return foundClass;

    }

    static async getScheducleClassByTeacherAll({
        idTeacher
    }) {
        const foundTeacher = await accountModel.findById(idTeacher).lean();
        if (!foundTeacher) throw new BadRequestError('foundTeacher NOT FOUND');
        const foundClass = await classStudents.find({
            teacherAccount: { $in: new Types.ObjectId(idTeacher) },
        }).populate({
            path: 'studentsAccount',
            select: '_id fullname study days phone'
        }).lean();
        if (!foundClass) throw new BadRequestError('CLASS NOT FOUND');
        return foundClass
    }



    static async addStudentsList({ idClass, idStudents = [] }) {
        const foundClass = await classStudents.findById(idClass).lean();
        if (!foundClass) throw new BadRequestError('CLASS NOT FOUND');
        const students = await Promise.all(
            idStudents.map(async (item) => {
                const student = await studentShecheduleModel.findById(item).lean();
                if (!student) return null;
                return student;
            })
        );
        if (students.includes(null)) throw new BadRequestError('Perhaps there is a problem with the student section !!!');
        const update = await classStudents.updateOne(
            { _id: new Types.ObjectId(idClass) },
            { $addToSet: { studentsAccount: { $each: idStudents } } },
            { new: true }
        );

        return update;
    }

    // getAllClass 
    static async getAllClass() {
        return await classStudents.find().lean().exec();
    }

    static async getClassByID(id) {
        return await classStudents.findById(id).populate({
            path: "teacherAccount",
            select: "_id username"
        }).select("nameClass teacherAccount days study  ").lean();
    }

    static async getStudetnsInClassByID(id) {
        return await classStudents.findById(id).populate({
            path: "studentsAccount",
            select: "_id fullname phone"
        }).select("nameClass studentsAccount teacherAccount").lean();
    }

    static async findStudentsByClass(id) {
        return await classStudents.find({
            studentsAccount: { $in: new Types.ObjectId(id) }
        }).populate({
            path: "teacherAccount",
            select: "username"
        }).select("nameClass days study teacherAccount ").lean();
    }




}

module.exports = ClassService;