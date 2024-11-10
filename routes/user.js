const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Cấu hình upload

const userController = require('../controllers/userController');


const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', userController.login);
router.put('/upload-avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);



//router.get('/users', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);
//router.post('/update-role', authenticateToken, authorizeRoles('admin'), userController.updateUserRole);

router.get('/getUsersPaginated', userController.getUsersPaginated);
router.get('/', userController.getAllUsers);
router.post('/', authenticateToken, userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/change-password', userController.changePassword);

// Route để đặt lại mật khẩu với token
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;
