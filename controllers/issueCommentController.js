const IssueComment = require('../models/IssueComment');
const Issue = require('../models/Issue');

// Lấy danh sách tất cả các comments cho một issue
exports.getAllCommentsForIssue = async (req, res) => {    
    try {
        const comments = await IssueComment.find({ issueId: req.params.issueId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

// Tạo một comment mới cho một issue
exports.createCommentForIssue = async (req, res) => {
    console.log("createCommentForIssue: ", req.body);
    try {
        const newComment = new IssueComment({
            ...req.body,
            issueId: req.params.issueId
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        console.log("createCommentForIssue error: ", error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
};

// Lấy thông tin chi tiết của một comment
exports.getCommentById = async (req, res) => {
    try {
        const comment = await IssueComment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment', error });
    }
};

// Cập nhật thông tin của một comment
exports.updateComment = async (req, res) => {
    try {
        const updatedComment = await IssueComment.findByIdAndUpdate(req.params.commentId, req.body, { new: true });
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error });
    }
};

// Xóa một comment
exports.deleteComment = async (req, res) => {
    try {
        const deletedComment = await IssueComment.findByIdAndDelete(req.params.commentId);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
    }
};
