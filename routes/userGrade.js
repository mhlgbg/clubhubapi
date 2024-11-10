const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware
const userGradeController = require('../controllers/userGradeController');

// Route để lấy phiếu điểm của người dùng
router.get('/user-grades', authenticateToken, userGradeController.getUserGrades);

module.exports = router;
