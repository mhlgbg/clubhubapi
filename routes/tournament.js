const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Lấy danh sách tournament
router.get('/', tournamentController.getAllTournaments);

// Thêm tournament
router.post('/', authenticateToken, tournamentController.createTournament);

// Cập nhật tournament
router.put('/:id', authenticateToken, tournamentController.updateTournament);

// Xóa tournament
router.delete('/:id', tournamentController.deleteTournament);

router.get('/tournaments-paginated', tournamentController.getPaginatedTournaments);


module.exports = router;
