const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,    
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,  // Đảm bảo email là bắt buộc
    unique: true,    // Email phải là duy nhất
  },
  phoneNumber: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending',
  }, 
  roles: {
    type: [String],
    enum: ['admin', 'manager', 'user', 'cus', 'hr', 'teacher'],
    default: ['user'],
  },
  // Thêm các trường cho chức năng đặt lại mật khẩu
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
