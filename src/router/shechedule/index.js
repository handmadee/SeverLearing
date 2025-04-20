'use strict';

const express = require("express");
const { asyncHandler } = require('./../../helpers/asyncHandler');
const { uploadExcel } = require('./../../untils/upload');
const router = express.Router();
const StudentShecheduleController = require("./../../controllers/schedule/schedule.controller");
const ettendanceScheduleController = require("./../../controllers/schedule/ettendance.controller");
const classController = require("../../controllers/schedule/class.controller");
const feedBackControler = require("../../feeback/controllers/feedBackControler");



// Querry search 
router.get('/searchStudents', asyncHandler(StudentShecheduleController.searchStudentsSchedule));
router.get('/exportShechedule', asyncHandler(StudentShecheduleController.exportStudentToExcelFile));
// Define routes
router.post('/importShechedule', uploadExcel.single('excelStudents'), asyncHandler(StudentShecheduleController.importShechedule));
// Import Students
router.post('/importPersonal', asyncHandler(StudentShecheduleController.importPersonalShechedule));
// Detete Student
router.delete('/deleteShechedule/:id', asyncHandler(StudentShecheduleController.deleteShechedule));
// Get All Students
router.get('/getShechedule/:id', asyncHandler(StudentShecheduleController.getShecheduleById));
// Create Student
router.put('/updateSchedule/:id', asyncHandler(StudentShecheduleController.updateShechedule));
//  get Sheducle 
router.get('/getScheducle', asyncHandler(StudentShecheduleController.getStudy));

// 
router.get('/getStudentsByDays', asyncHandler(StudentShecheduleController.getStudentsByDays));
router.get('/getStudentsAll', asyncHandler(StudentShecheduleController.getStudentsALL));
router.get('/getStudentsByStudy', asyncHandler(StudentShecheduleController.getStudentsByStudy));
router.get('/getStudentsByStudyByDays', asyncHandler(StudentShecheduleController.getStudentsByStudyByDays));


// get Sheducle 

// Attendance 
router.post('/attendance', asyncHandler(ettendanceScheduleController.create));
// find date and study
router.post('/attendanceTeacher', asyncHandler(ettendanceScheduleController.getStudentBySchedule));

// ID teacher
router.get('/attendanceTeacherV2/:id', asyncHandler(ettendanceScheduleController.getStudentByScheduleOfTeacher));

// 
router.get(
    '/attendance/by-teacher',
    asyncHandler(ettendanceScheduleController.findStudentsByDateV3)
);



// find date and study
router.post('/attendanceTeacherByDate', asyncHandler(ettendanceScheduleController.findStudentsByDate));
// change attendance
router.patch('/changeAttendance/:id', asyncHandler(ettendanceScheduleController.changeAttendance));
// Get all attendance 
router.post('/getAttendanceAloneByAccount/:id', asyncHandler(ettendanceScheduleController.getAttendanceAloneByAccount));
// get date teacher 
router.post('/getAttendanceAloneByTeacher', asyncHandler(ettendanceScheduleController.getAttendanceAloneByTeacher));

// update antendace 
router.patch('/updateSchedule/:id', asyncHandler(ettendanceScheduleController.updateStudentManyByTeacher));




// Student
router.get('/class', asyncHandler(classController.getClassAll));
router.patch('/class/:id', asyncHandler(classController.editClassByID));
router.get('/classByID/:id', asyncHandler(classController.getClassByID))
router.get('/allStudentInClass/:id', asyncHandler(classController.getStudetnsInClassByID));
// điểm danh ngayf
router.get('/class/day', asyncHandler(classController.getClassByDays));
// điểm danh ngàY VÀ GIÁO VIÊN
router.get('/class/teacher/:id', asyncHandler(classController.getClassByTeacher));
// Lọc giáo viên điểm danh và ngày
router.get('/class/:id', asyncHandler(classController.getScheducleClassByTeacherAll));

router.delete('/class/:id', asyncHandler(classController.deleteClass))

// pOST
router.post('/class', asyncHandler(classController.createClass));
// edit class
router.patch('/classAddStudent', asyncHandler(classController.addStudentsToClass));
// router.patch('/class/addStudent', asyncHandler(classController.addStudentsToClass));
router.get('/feedback/export-feedback', asyncHandler(feedBackControler.exportExcelFeedBack));
//

router.patch('/classStudents/removeStudent', asyncHandler(classController.removeStudentsToClass));
// Nhận xét
router.get('/feedback/:id', asyncHandler(feedBackControler.getAllFeedBackByStudent));
router.get('/feedbackStudents/:id', asyncHandler(feedBackControler.getAllFeedBackByID));
router.get('/feedback/students/:id', asyncHandler(feedBackControler.getFeedBackByIdForMonth));


// Get By ID AND MONTH
router.get('/feedback/teacher/:id', asyncHandler(feedBackControler.getFeedBackByIdTeacherForMonth));
// Lấy tất cả feed back bằng ID teacher 
router.get('/feedbackByTeacher/:id', asyncHandler(feedBackControler.getFeedAllBackTeacher));
// Lấy tất cả feed back bằng tháng
router.get('/feedbackByMonth', asyncHandler(feedBackControler.getFeedBackForMonth));



router.get('/feedback/find-id/:id', asyncHandler(feedBackControler.getFeedBackById));
router.post('/feedback', asyncHandler(feedBackControler.createdFeedBack));
router.post('/create-file/feedback', uploadExcel.single('excel'), asyncHandler(feedBackControler.createBulkFileFeedback));
router.post('/create-bulk/feedback', asyncHandler(feedBackControler.createBulkFeedback));
router.delete('/delete-bulk/feedback', asyncHandler(feedBackControler.deleteBulkFeeback));
router.patch('/feedback/:id', asyncHandler(feedBackControler.modifreFeedBack));
router.delete('/feedback/:id', asyncHandler(feedBackControler.removeFeedBack));


module.exports = router;