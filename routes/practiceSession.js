const express = require('express');
const router = express.Router();
const practiceSessionController = require('../controllers/practiceSessionController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Match routes
// PracticeSession routes
router.get('/:clubId/practices', practiceSessionController.getPracticeSessionsByClub);

router.post('/', authenticateToken, practiceSessionController.createPracticeSession); // Tạo mới buổi tập luyện
router.get('/', practiceSessionController.getAllPracticeSessions); // Lấy tất cả buổi tập luyện
router.get('/:id', practiceSessionController.getPracticeSessionById); // Lấy buổi tập luyện theo ID
router.put('/:id', authenticateToken, practiceSessionController.updatePracticeSessionById); // Cập nhật buổi tập luyện theo ID
router.delete('/:id', practiceSessionController.deletePracticeSessionById); // Xóa buổi tập luyện theo ID



module.exports = router;