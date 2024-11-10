const express = require('express');
const router = express.Router();
const studentTaskController = require('../controllers/studentTaskController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware
const multer = require('multer')

// Cấu hình multer để xử lý tải lên ảnh đại diện
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/studentcomment/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

router.get('/mytasks', authenticateToken, studentTaskController.getStudentTasks);
// Route để lấy danh sách nhiệm vụ của sinh viên


// Route để lấy chi tiết nhiệm vụ và danh sách comment của một nhiệm vụ
router.get('/:userTaskId', authenticateToken, studentTaskController.getTaskDetails);

// Route để nộp comment cho một nhiệm vụ
//router.post('/:userTaskId/comment', authenticateToken, studentTaskController.submitComment);
router.post('/:userTaskId/comment', authenticateToken, upload.single('content'), studentTaskController.submitComment);

module.exports = router;
