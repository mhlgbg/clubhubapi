const mongoose = require('mongoose');

const issueCommentSchema = new mongoose.Schema({
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true }, // Tham chiếu đến vấn đề liên quan
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người bình luận
    commentType: { type: String, enum: ['text', 'html', 'video', 'image'], required: true }, // Loại nội dung bình luận
    contentValue: { type: String, required: true }, // Nội dung bình luận
    createdDate: { type: Date, default: Date.now } // Ngày tạo bình luận
});

const IssueComment = mongoose.model('IssueComment', issueCommentSchema);

module.exports = IssueComment;
