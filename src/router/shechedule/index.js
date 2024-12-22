'use strict';

const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const { uploadExcel } = require('./../../untils/upload');
const router = express.Router();
const StudentShecheduleController = require("./../../controllers/schedule/schedule.controller");
const ettendanceScheduleController = require("./../../controllers/schedule/ettendance.controller");
const classController = require("../../controllers/schedule/class.controller");
const feedBackControler = require("../../feeback/controllers/feedBackControler");



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

// 
router.get('/getStudentsByDays', asnycHandler(StudentShecheduleController.getStudentsByDays));
router.get('/getStudentsAll', asnycHandler(StudentShecheduleController.getStudentsALL));
router.get('/getStudentsByStudy', asnycHandler(StudentShecheduleController.getStudentsByStudy));
router.get('/getStudentsByStudyByDays', asnycHandler(StudentShecheduleController.getStudentsByStudyByDays));


// get Sheducle 

// Attendance 
router.post('/attendance', asnycHandler(ettendanceScheduleController.create));
// find date and study
router.post('/attendanceTeacher', asnycHandler(ettendanceScheduleController.getStudentBySchedule));

// ID teacher
router.get('/attendanceTeacherV2/:id', asnycHandler(ettendanceScheduleController.getStudentByScheduleOfTeacher));





// find date and study
router.post('/attendanceTeacherByDate', asnycHandler(ettendanceScheduleController.findStudentsByDate));
// change attendance
router.patch('/changeAttendance/:id', asnycHandler(ettendanceScheduleController.changeAttendance));
// Get all attendance 
router.post('/getAttendanceAloneByAccount/:id', asnycHandler(ettendanceScheduleController.getAttendanceAloneByAccount));
// get date teacher 
router.post('/getAttendanceAloneByTeacher', asnycHandler(ettendanceScheduleController.getAttendanceAloneByTeacher));

// update antendace 
router.patch('/updateSchedule/:id', asnycHandler(ettendanceScheduleController.updateStudentManyByTeacher));




// Student
router.get('/class', asnycHandler(classController.getClassAll));
router.patch('/class/:id', asnycHandler(classController.editClassByID));
router.get('/classByID/:id', asnycHandler(classController.getClassByID))
router.get('/allStudentInClass/:id', asnycHandler(classController.getStudetnsInClassByID));
// điểm danh ngayf
router.get('/class/day', asnycHandler(classController.getClassByDays));
// điểm danh ngàY VÀ GIÁO VIÊN
router.get('/class/teacher/:id', asnycHandler(classController.getClassByTeacher));
// Lọc giáo viên điểm danh và ngày
router.get('/class/:id', asnycHandler(classController.getScheducleClassByTeacherAll));

router.delete('/class/:id', asnycHandler(classController.deleteClass))

// pOST
router.post('/class', asnycHandler(classController.createClass));
// edit class
router.patch('/classAddStudent', asnycHandler(classController.addStudentsToClass));
// router.patch('/class/addStudent', asnycHandler(classController.addStudentsToClass));
router.patch('/classStudents/removeStudent', asnycHandler(classController.removeStudentsToClass));
// Nhận xét
router.get('/feedback/:id', asnycHandler(feedBackControler.getAllFeedBackByStudent));
router.get('/feedbackStudents/:id', asnycHandler(feedBackControler.getAllFeedBackByID));
router.get('/feedback/students/:id', asnycHandler(feedBackControler.getFeedBackByIdForMonth));

// Get By ID AND MONTH
router.get('/feedback/teacher/:id', asnycHandler(feedBackControler.getFeedBackByIdTeacherForMonth));
// Lấy tất cả feed back bằng ID teacher 
router.get('/feedbackByTeacher/:id', asnycHandler(feedBackControler.getFeedAllBackTeacher));
// Lấy tất cả feed back bằng tháng
router.get('/feedbackByMonth', asnycHandler(feedBackControler.getFeedBackForMonth));



router.get('/feedback/find-id/:id', asnycHandler(feedBackControler.getFeedBackById));

router.post('/feedback', asnycHandler(feedBackControler.createdFeedBack));
router.patch('/feedback/:id', asnycHandler(feedBackControler.modifreFeedBack));
router.delete('/feedback/:id', asnycHandler(feedBackControler.removeFeedBack));


module.exports = router;