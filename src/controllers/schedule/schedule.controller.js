const { ForbiddenError } = require('../../core/error.response');
const { OK } = require('../../core/success.response');
const StudentShecheduleService = require('../../services/schedule/schedule.service');
const attendanceService = require('../../services/schedule/attendance.services');
const _ = require("lodash");
const { convertExcelToStudentsJson, exportStudentToExcel } = require('../../untils/xlsx');
const { delFile } = require('../../untils/file.untils');
path = require('path');
fs = require('fs');
class StudentShecheduleController {

    // async importShechedule(req, res) {
    //     const file = req.file;
    //     const workbook = xlsx.readFile(file.path);
    //     const sheetName = workbook.SheetNames[0];
    //     const worksheet = workbook.Sheets[sheetName];
    //     const data = xlsx.utils.sheet_to_json(worksheet);
    //     // delete file after read
    //     fs.unlinkSync(file.path);
    //     const convertDays = (daysString) => {
    //         return daysString.split(',').map(day => parseInt(day.trim()));
    //     }
    //     const convertedData = data.map(item => {
    //         return {
    //             ...item,
    //             days: convertDays(item.days)
    //         };

    //     });
    //     return new OK({
    //         message: 'Import success',
    //         sheetName,
    //         data: await StudentShecheduleService.importStudents(convertedData)
    //     }).send(res);
    // }


    async importShechedule(req, res) {
        try {
            const file = req.file;
            const convertedData = convertExcelToStudentsJson(file.path);
            console.log(convertedData);
            delFile(file.path);
            return new OK({
                message: 'Import student success',
                data: await StudentShecheduleService.importStudents(convertedData)
            }).send(res);
        } catch (error) {
            console.log(error);
            return new ForbiddenError({
                message: 'Import student failed'
            }).send(res);
        }
    }

    async exportStudentToExcelFile(req, res) {
        // EXPORT DOWLOAD   
        try {
            const rg = Math.floor(Math.random() * 10);
            const outputDir = './output';
            const data = await StudentShecheduleService.getAll();
            const outputPath = path.join(outputDir, `students$_${rg}.xlsx`);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            const isExported = exportStudentToExcel(data, outputPath);
            if (isExported) {
                if (fs.existsSync(outputPath)) {
                    res.download(outputPath, (err) => {
                        if (err) {
                            console.error('Error when sending file:', err);
                            return res.status(500).send('Error downloading the file');
                        }
                        fs.unlinkSync(outputPath);
                    });
                } else {
                    return res.status(404).send('File not found');
                }
            } else {
                return res.status(500).send('Error exporting Excel file');
            }
        } catch (error) {
            console.log(error);
            return new ForbiddenError({
                message: 'Export failed'
            }).send(res);
        }
    }


    async getAllShechedule(req, res) {
        const { page, limit } = req.query;
        const shechedules = await StudentShecheduleService.getAllShechedule(page, limit);

        return new OK({
            data: shechedules
        }).send(res);
    }
    async deleteShechedule(req, res) {
        const id = req.params.id;
        await StudentShecheduleService.remove(id);
        await attendanceService.delAccountID(id);
        //! xoas his
        return new OK({
            message: 'Delete success'
        }).send(res);
    }
    async getShecheduleById(req, res) {
        const shechedule = await StudentShecheduleService.getById(req.params.id);
        return new OK({
            data: shechedule
        }).send(res);
    }
    async updateShechedule(req, res) {
        console.log(req.body)
        const shechedule = await StudentShecheduleService.update(req.params.id, req.body);
        return new OK({
            data: shechedule
        }).send(res);
    }
    // get days and Study
    async getStudy(req, res) {
        const { study, days } = req.query;
        console.log(study, days)
        const shechedule = await StudentShecheduleService.getStudy(study, days);
        return new OK({
            data: shechedule
        }).send(res);
    }
    // import students
    async importPersonalShechedule(req, res) {
        const data = req.body;
        const result = await StudentShecheduleService.create(data);
        return new OK({
            data: result
        }).send(res);
    }
    // Query 
    async searchStudentsSchedule(req, res) {
        const keyword = req.query.qkeyword;
        console.log({
            message: `search : ${keyword}`
        })
        const data = await StudentShecheduleService.searchStudents(keyword);
        console.log({
            message: `search : ${keyword}`,
            data
        })
        return new OK({
            message: `search success`,
            data
        }).send(res)
    }

    ///getStudentsByDays
    async getStudentsByDays(req, res) {
        const { days } = req.query;
        const result = await StudentShecheduleService.getStudentsByDays(days);
        return new OK({
            data: result
        }).send(res);
    }

    ///getStudentsByStudy
    async getStudentsByStudy(req, res) {
        const { study } = req.query;
        const result = await StudentShecheduleService.getStudentsByStudy(study);
        return new OK({
            data: result
        }).send(res);
    }

    ///getStudentsByStudyByDays
    async getStudentsByStudyByDays(req, res) {
        const { study, days } = req.query;
        const result = await StudentShecheduleService.getStudentsByStudyByDays(days, study);
        return new OK({
            data: result
        }).send(res);
    }

    // get All 
    async getStudentsALL(req, res) {
        const result = await StudentShecheduleService.getAll();
        return new OK({
            data: result
        }).send(res);
    }

}
module.exports = new StudentShecheduleController();