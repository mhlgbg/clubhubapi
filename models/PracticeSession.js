const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên buổi tập luyện
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true }, // Tham chiếu tới bảng Club
  practiceDate: { type: Date, required: true }, // Ngày tập luyện
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu tới bảng User (người tạo)
  lastUpdatedDate: { type: Date, default: Date.now }, // Thời điểm cập nhật cuối
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tham chiếu tới bảng User (người cập nhật cuối)
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }], // Danh sách các trận đấu (tham chiếu tới bảng Match)
  notes: { type: String } // Ghi chú về buổi tập luyện
});

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
