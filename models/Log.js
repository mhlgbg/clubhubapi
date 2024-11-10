const mongoose = require('mongoose');

// Định nghĩa schema cho bảng Log
const logSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true, // Mỗi phiên phải có một sessionId duy nhất
        trim: true
    },
    ipAddress: {
        type: String,
        required: true, // Địa chỉ IP của người dùng
        trim: true
    },
    userAgent: {
        type: String,
        required: true, // Thông tin trình duyệt hoặc thiết bị người dùng
        trim: true
    },
    visitedUrl: {
        type: String,
        required: true, // Đường dẫn URL mà người dùng đã truy cập
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Tự động thêm ngày giờ khi log được tạo
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model Log từ schema
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
