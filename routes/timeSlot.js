const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

const express = require('express');
const router = express.Router();
const slotController = require('../controllers/timeSlotController');

// Lấy thông tin quản lý Slot
router.get('/', authenticateToken, slotController.getSlotManagementData);
router.get('/:playgroundId/:date', slotController.getSlotsByPlaygroundAndDate);

// Tạo, sửa, xóa slot
router.post('', slotController.createSlot);
router.put('/:slotId', slotController.updateSlot);
router.delete('/:slotId', slotController.deleteSlot);
router.post('/copy', slotController.copySlots);

module.exports = router;
