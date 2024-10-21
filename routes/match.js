const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware
router.get('/matchesbyday', matchController.getMatchesByDays);
router.get('/:practiceSessionId/matches-of-practice', matchController.getAllMatchesOfPractice); // Lấy tất cả các trận đấu
router.post('/add_match_to_practice', authenticateToken, matchController.addMatchToPractice); // Tạo mới trận đấu
router.put('/edit-match-of-practice/:matchId', authenticateToken, matchController.editMatchOfPractice);

// Match routes
router.post('/matches', matchController.createMatch); // Tạo mới trận đấu
router.get('/matches', matchController.getAllMatches); // Lấy tất cả các trận đấu
router.get('/:id', matchController.getMatchById); // Lấy trận đấu theo ID
router.put('/:id', matchController.updateMatchById); // Cập nhật trận đấu theo ID
router.delete('/:id', matchController.deleteMatchById); // Xóa trận đấu theo ID


//matches?practiceSessionId=<practiceSessionId></practiceSessionId>


module.exports = router;