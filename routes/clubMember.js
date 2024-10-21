const express = require('express');
const router = express.Router();
const clubMemberController = require('../controllers/clubMemberController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Lấy danh sách thành viên theo clubId
router.get('/:clubId/members', clubMemberController.getClubMembers);

// Tạo mới thành viên cho câu lạc bộ
router.post('/:clubId/members', authenticateToken, clubMemberController.createClubMember);

// Cập nhật thông tin thành viên
router.put('/:id', authenticateToken, clubMemberController.updateClubMember);

// Xóa thành viên khỏi câu lạc bộ
router.delete('/:id', clubMemberController.deleteClubMember);

// Route to get all clubs the user is a member of
router.get('/my-clubs', authenticateToken, clubMemberController.getMyClubs);

// Route to request to join a club by club code
router.post('/join-club', authenticateToken, clubMemberController.joinClub);

router.put('/:memberId/approve', clubMemberController.approveMember);
router.put('/:memberId/reject', clubMemberController.rejectMember);
router.put('/:memberId/edit-nick', clubMemberController.editNick);

router.post('/:clubId/invite', authenticateToken, clubMemberController.inviteUserToClub);

module.exports = router;
