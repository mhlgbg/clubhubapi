// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Route để gửi tin nhắn liên hệ
router.post('/', contactController.sendMessage);
router.get('/', contactController.getContactMessages);

module.exports = router;
