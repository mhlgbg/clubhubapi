const express = require('express');
const router = express.Router();
const { getSports, getSportById, createSport, updateSport, deleteSport } = require('../controllers/sportController');

// Lấy tất cả các môn thể thao
router.get('/', getSports);

// Lấy môn thể thao theo ID
router.get('/:id', getSportById);

// Tạo mới môn thể thao
router.post('/', createSport);

// Cập nhật môn thể thao theo ID
router.put('/:id', updateSport);

// Xóa môn thể thao theo ID
router.delete('/:id', deleteSport);

module.exports = router;
