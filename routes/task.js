const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Lấy danh sách tất cả các Task (có phân trang và tìm kiếm)
router.get('/all', authenticateToken, taskController.getAllTasks);

router.get('/', taskController.getTasks);

// Lấy thông tin chi tiết của một Task
router.get('/:taskId', taskController.getTaskById);

// Tạo mới một Task
router.post('/', authenticateToken, taskController.createTask);

// Cập nhật thông tin một Task
router.put('/:taskId', taskController.updateTask);

// Xóa một Task
router.delete('/:taskId', taskController.deleteTask);


module.exports = router;
