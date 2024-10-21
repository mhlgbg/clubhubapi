const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware
const upload = require('../middleware/upload');



router.get('/clubs/:clubId/managers', clubController.getClubManagers);

// Mời một người dùng làm quản lý của CLB
router.post('/clubs/:clubId/invite-manager', authenticateToken, clubController.inviteManager);

// Đặt các route có tên cố định trước
router.get('/clubs/:clubId/members', clubController.getMembersByClubId);
router.get('/clubs/clubs-paginated', clubController.getClubsPaginated);
router.get('/clubs/club-of-users', authenticateToken, clubController.getClubsOfUser);
// Sau đó đặt các route có tham số động như :id
router.get('/clubs/details/:id', clubController.getClubDetails);
router.get('/clubs/clubs-by-ids', clubController.getClubsByIds);
// Routes for managing clubs
router.get('/clubs/clubs-for-mobile', clubController.getClubsForMobile);
router.get('/clubs', clubController.getClubs);
router.post('/clubs', clubController.createClub);
router.put('/clubs/:id', upload.single('avatar'), clubController.updateClub);
router.delete('/clubs/:id', clubController.deleteClub);


module.exports = router;
