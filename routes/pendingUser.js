const express = require('express');
const router = express.Router();
const pendingUserController = require('../controllers/pendingUserController');

router.post('/register', pendingUserController.registerPendingUser);
router.get('/activate/:token', pendingUserController.activateUser);


module.exports = router;
