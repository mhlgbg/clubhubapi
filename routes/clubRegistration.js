const express = require('express');
const router = express.Router();
const clubRegistrationController = require('../controllers/clubRegistrationController');
const rateLimit = require('express-rate-limit');

const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 4, // Cho phép tối đa 3 lần đăng ký mỗi giờ từ 1 IP
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 1 giờ."
  });

// Routes for managing club registrations
router.get('/', clubRegistrationController.getClubRegistrations);
router.post('/', registrationLimiter, clubRegistrationController.createAndApproveClubRegistration);
router.put('/:id', authenticateToken, clubRegistrationController.updateClubRegistration);
router.delete('/:id', clubRegistrationController.deleteClubRegistration);

module.exports = router;
