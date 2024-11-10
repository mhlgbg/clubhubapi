const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người tạo issue
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'IssueCategory', required: true }, // Loại vấn đề
    title: { type: String, required: true }, // Tiêu đề của vấn đề
    description: { type: String, required: true }, // Mô tả chi tiết vấn đề
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' }, // Trạng thái của vấn đề
    createdDate: { type: Date, default: Date.now }, // Ngày tạo vấn đề
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người cập nhật cuối cùng
    resolvedDate: { type: Date }, // Thời điểm đóng vấn đề
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IssueComment' }] // Các bình luận liên quan
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
