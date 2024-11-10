const mongoose = require('mongoose');

const UserNotificationSchema = new mongoose.Schema({
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true }, // Thông báo Id
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng Id
    createdDate: { type: Date, default: Date.now }, // Thời điểm tạo bản ghi
    readDate: { type: Date }, // Thời điểm đọc
    confirmedRead: { type: Boolean, default: false }, // Xác nhận đã đọc
    confirmedReadDate: { type: Date } // Thời điểm nhấn xác nhận
  });

const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);
module.exports = UserNotification;
