const express = require('express');
const router = express.Router();
const IssueCommentController = require('../controllers/issueCommentController');

// Lấy danh sách tất cả các comments cho một issue
router.get('/:issueId/comments', IssueCommentController.getAllCommentsForIssue);

// Tạo một comment mới cho một issue
router.post('/:issueId/comments', IssueCommentController.createCommentForIssue);

// Lấy thông tin chi tiết của một comment
router.get('/:issueId/comments/:commentId', IssueCommentController.getCommentById);

// Cập nhật thông tin của một comment
router.put('/:issueId/comments/:commentId', IssueCommentController.updateComment);

// Xóa một comment
router.delete('/:issueId/comments/:commentId', IssueCommentController.deleteComment);

module.exports = router;
