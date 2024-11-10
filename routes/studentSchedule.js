
const express = require('express');
const router = express.Router();
const studentScheduleController = require('../controllers/studentScheduleController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

router.get('/schedules', authenticateToken, studentScheduleController.getSchedulesOfStudent);
module.exports = router;
