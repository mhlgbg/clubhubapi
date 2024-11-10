const Issue = require('../models/Issue');
const IssueComment = require('../models/IssueComment');

const mongoose = require('mongoose');



exports.getIssueDetailWithComments = async (req, res) => {
    console.log("getIssueDetailWithComments: ", req.params);
    try {
        // Tìm kiếm issue theo ID và populate thêm thông tin người tạo và căn hộ
        const issue = await Issue.findById(req.params.id)
            .populate('userId', 'username'); // Populate chỉ lấy trường username từ user

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Tìm kiếm tất cả comments liên quan đến issue này và sắp xếp theo ngày tạo
        const comments = await IssueComment.find({ issueId: req.params.id }).sort({ createdDate: 1 }).populate('userId', 'username');;
        //console.log("getIssueDetailWithComments comments: ", comments);
        // Trả về thông tin issue cùng với danh sách comments
        res.status(200).json({
            issue,
            comments
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue details and comments', error });
    }
};


// Lấy danh sách tất cả các issues
exports.getAllIssues = async (req, res) => {
    console.log("All issues");
    try {
        const issues = await Issue.find();
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issues', error });
    }
};

// Tạo một issue mới
exports.createIssue = async (req, res) => {
    console.log('res.body', res.body);
    try {
        const newIssue = new Issue(req.body);
        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Error creating issue', error });
    }
};

// Lấy thông tin chi tiết của một issue
exports.getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue', error });
    }
};

// Cập nhật thông tin của một issue
exports.updateIssue = async (req, res) => {
    try {
        const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Error updating issue', error });
    }
};

// Xóa một issue
exports.deleteIssue = async (req, res) => {
    try {
        const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
        if (!deletedIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting issue', error });
    }
};


exports.addComment = async (req, res) => {
    
    try {
        const { id } = req.params; // issueId
        const { commentType, contentValue } = req.body;
        console.log("addComment", id);
        console.log("addComment", req.body);
        console.log("addComment",req.user.id);
        const comment = new IssueComment({
            issueId: id,
            commentType,
            contentValue,
            userId: req.user.id, // Lấy từ token đăng nhập
        });
        
        await comment.save();
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};
exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params; // issueId
        const { status } = req.body;

        await Issue.findByIdAndUpdate(id, { status });
        res.status(200).json({ message: 'Issue status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating issue status' });
    }
};
