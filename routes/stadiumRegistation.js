const express = require('express');
const router = express.Router();
const stadiumRegistrationController = require('../controllers/stadiumRegistrationController');

router.post('/register', stadiumRegistrationController.registerStadium);

module.exports = router;