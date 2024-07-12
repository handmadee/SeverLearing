'use strict';

const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const { uploadExcel } = require('./../../untils/upload');
const router = express.Router();
const StudentShecheduleController = require("./../../controllers/schedule/schedule.controller");
const ettendanceScheduleController = require("./../../controllers/schedule/ettendance.controller");


// Querry search 
router.get('/searchStudents', asnycHandler(StudentShecheduleController.searchStudentsSchedule));

// Define routes
router.post('/importShechedule', uploadExcel.single('excelStudents'), asnycHandler(StudentShecheduleController.importShechedule));
// Import Students
router.post('/importPersonal', asnycHandler(StudentShecheduleController.importPersonalShechedule));
// Detete Student
router.delete('/deleteShechedule/:id', asnycHandler(StudentShecheduleController.deleteShechedule));
// Get All Students
router.get('/getShechedule/:id', asnycHandler(StudentShecheduleController.getShecheduleById));
// Create Student
router.put('/updateSchedule/:id', asnycHandler(StudentShecheduleController.updateShechedule));
//  get Sheducle 
router.get('/getScheducle', asnycHandler(StudentShecheduleController.getStudy));

// Attendance 
router.post('/attendance', asnycHandler(ettendanceScheduleController.create));
// find date and study
router.post('/attendanceTeacher', asnycHandler(ettendanceScheduleController.getStudentBySchedule));
// find date and study
router.post('/attendanceTeacherByDate', asnycHandler(ettendanceScheduleController.findStudentsByDate));
// change attendance
router.patch('/changeAttendance/:id', asnycHandler(ettendanceScheduleController.changeAttendance));
// Get all attendance 
router.post('/getAttendanceAloneByAccount/:id', asnycHandler(ettendanceScheduleController.getAttendanceAloneByAccount));
// get date teacher 
router.post('/getAttendanceAloneByTeacher', asnycHandler(ettendanceScheduleController.getAttendanceAloneByTeacher));



module.exports = router;