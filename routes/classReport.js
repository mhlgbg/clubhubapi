const express = require('express');
const router = express.Router();
const classReportController = require('../controllers/classReportController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Định nghĩa các routes cho classReport
router.get('/:scheduleId', authenticateToken, classReportController.getClassReport);
router.post('/:scheduleId/teacher-note', authenticateToken, classReportController.addTeacherNote);
router.put('/:scheduleId/teacher-note/:noteId', authenticateToken, classReportController.updateTeacherNote);
router.delete('/:scheduleId/teacher-note/:noteId', authenticateToken, classReportController.deleteTeacherNote);

router.post('/:scheduleId/task', authenticateToken, classReportController.addTask);
router.delete('/:scheduleId/task/:taskId', authenticateToken, classReportController.deleteTask);

router.get('/:scheduleId/attendance', authenticateToken, classReportController.getAttendance);
router.post('/:scheduleId/attendance', authenticateToken, classReportController.addAttendance);
router.put('/:scheduleId/attendance/:userId', authenticateToken, classReportController.updateAttendanceStatus);

router.get('/:scheduleId/grades', authenticateToken, classReportController.getGrades);
router.post('/:scheduleId/grades', authenticateToken, classReportController.addGradeAssessment);
//router.put('/:scheduleId/grades/:assessmentName/:userId', authenticateToken, classReportController.updateGrade);
//router.put('/:scheduleId/grades/:assessmentName', authenticateToken, classReportController.updateGrade);

//router.put('/:scheduleId/complete', authenticateToken, classReportController.completeClassReport);

router.get('/:scheduleId/attendance', authenticateToken, classReportController.fetchAttendance);
router.post('/:scheduleId/attendance/fetch-students', authenticateToken, classReportController.fetchClassStudentsForAttendance);
router.put('/:scheduleId/attendance/:userId', authenticateToken, classReportController.updateAttendanceStatus);


//router.post('/:scheduleId/grades/:assessmentName/fetch-students', authenticateToken, classReportController.fetchStudentsForGrade);

router.delete('/:scheduleId/grades/:assessmentName', authenticateToken, classReportController.deleteGrade);


// Các route khác
router.put('/:scheduleId/grades/:assessmentName', authenticateToken, classReportController.updateGrade);
router.get('/:scheduleId/grades/:assessmentName', authenticateToken, classReportController.getGradeScores);
router.post('/:scheduleId/grades/:assessmentName/fetch-students', authenticateToken, classReportController.fetchStudentsForGrade);

router.get('/:scheduleId/individual-tasks', authenticateToken, classReportController.getIndividualTasks);
router.post('/:scheduleId/individual-tasks', authenticateToken, classReportController.addIndividualTask);
router.delete('/:scheduleId/individual-tasks/:taskId', authenticateToken, classReportController.deleteIndividualTask);

router.put('/:scheduleId/individual-tasks/:taskId', authenticateToken, classReportController.updateIndividualTask);
router.get('/:scheduleId/individual-messages', classReportController.getIndividualMessages);
router.post('/:scheduleId/individual-messages', classReportController.addIndividualMessage);


router.put('/:scheduleId/complete', authenticateToken, classReportController.markScheduleAsCompleted);

module.exports = router;
