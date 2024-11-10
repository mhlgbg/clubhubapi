const express = require('express')
const scheduleController = require('../controllers/scheduleController')
const router = express.Router()
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware


// Lấy danh sách lịch giảng dạy với phân trang và tìm kiếm
router.get('/', scheduleController.getSchedules)

// Tạo mới lịch giảng dạy
router.post('/', authenticateToken, scheduleController.createSchedule)

// Cập nhật lịch giảng dạy
router.put('/:id', scheduleController.updateSchedule)

// Xóa lịch giảng dạy
router.delete('/:id', scheduleController.deleteSchedule)

// Lấy danh sách lớp học
router.get('/classes', scheduleController.getClasses)

// Lấy danh sách giáo viên
router.get('/teachers', scheduleController.getTeachers)
router.get('/teaching-cards', authenticateToken, scheduleController.getTeachingCards)




module.exports = router
