const express = require('express');
const router = express.Router();
const configurationController = require('../controllers/configurationController');
router.get('/:key', configurationController.getConfigByKey);

// Lấy danh sách cấu hình
router.get('/', configurationController.getConfigurations);

// Thêm mới một cấu hình
router.post('/', configurationController.createConfiguration);

// Cập nhật cấu hình
router.put('/:id', configurationController.updateConfiguration);

// Xóa cấu hình
router.delete('/:id', configurationController.deleteConfiguration);

module.exports = router;
