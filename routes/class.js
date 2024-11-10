const express = require('express')
const classController = require('../controllers/classController')
const router = express.Router()
const multer = require('multer')
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Cấu hình multer để xử lý tải lên ảnh đại diện
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

// Định nghĩa các route
router.get('/', classController.getClasses) // Lấy danh sách lớp học
router.post('/', upload.single('avatar'), classController.createClass) // Tạo lớp học
router.put('/:id', upload.single('avatar'), classController.updateClass) // Cập nhật lớp học
router.delete('/:id', classController.deleteClass) // Xóa lớp học
// Route để thêm học viên vào lớp dựa trên email
router.post('/enrollments', authenticateToken, classController.addStudentToClass);

// Route để lấy danh sách học viên của một lớp
router.get('/enrollments/class/:classId', classController.getClassStudents);
router.delete('/enrollments/:userId/:classId', classController.deleteStudentOfClass) // Xóa lớp học

module.exports = router
