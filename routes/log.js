const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Route để lấy tất cả các log
router.get('/', logController.getLogs);

// Route để lấy log theo username
router.get('/:username', logController.getLogsByUsername);
router.post('/track-visit', logController.createLog);

module.exports = router;
