const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  regulations: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true,
    default: null
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  organizingUnit: {
    type: String,
    required: true,
    trim: true
  },
  tournamentPoints: {
    type: Number,
    required: true
  },
  maxIndividualPoints: {
    type: Number,
    required: true
  },
  expectedStartDate: {
    type: Date,
    required: true
  },
  expectedEndDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  minParticipants: {
    type: Number,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['Đăng ký', 'Đóng Đăng Ký', 'Đang Diễn Ra', 'Kết Thúc'],
    required: true
  },
  managers: [{ // Thêm trường để lưu danh sách người quản lý giải đấu
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Tham chiếu tới bảng User
  }],  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Reference to the user who created the tournament
  },  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Reference to the user who last updated the tournament
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
