const express = require('express');
const router = express.Router();
const IssueController = require('../controllers/issueController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route thêm bình luận (đảm bảo người dùng đã xác thực)
//router.post('/issues/:id/comments', authenticateToken, IssueController.addComment);
router.post('/issues/:id/comments', authenticateToken, IssueController.addComment);


//router.get('/track-issues', IssueController.getTrackIssues);

router.get('/issue-detail/:id', IssueController.getIssueDetailWithComments);


// Lấy danh sách tất cả các issues
router.get('/all', IssueController.getAllIssues);

// Tạo một issue mới
router.post('/', IssueController.createIssue);

// Lấy thông tin chi tiết của một issue
router.get('/:id', IssueController.getIssueById);

// Cập nhật thông tin của một issue
router.put('/:id', IssueController.updateIssue);

// Xóa một issue
router.delete('/:id', IssueController.deleteIssue);

// Cập nhật trạng thái issue (đảm bảo người dùng đã xác thực)
router.put('/issues/:id/status', authenticateToken, IssueController.updateIssueStatus);

module.exports = router;
