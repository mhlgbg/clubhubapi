const express = require('express');
const router = express.Router();
const { 
    getCoaches, 
    createCoach, 
    getCoachById, 
    updateCoach, 
    deleteCoach,
    getCoachesByIds,
    getCoachesForMobile,
    getPaginatedCoaches
    
} = require('../controllers/coachController');

router.get('/coaches-paginated', getPaginatedCoaches);

router.get('/coaches-by-ids', getCoachesByIds);

// Lấy tất cả huấn luyện viên
router.get('/coaches-for-mobile', getCoachesForMobile); // Route cụ thể hơn
router.get('/', getCoaches); // Route tổng quát cho danh sách coaches


// Tạo mới huấn luyện viên
router.post('/', createCoach);

// Lấy thông tin huấn luyện viên theo ID
router.get('/:id', getCoachById);

// Cập nhật huấn luyện viên theo ID
router.put('/:id', updateCoach);

// Xóa huấn luyện viên theo ID
router.delete('/:id', deleteCoach);

module.exports = router;
