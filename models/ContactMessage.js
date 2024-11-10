// models/ContactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  address: { type: String },
  message: { type: String, required: true },
  ipAddress: { type: String }, // Lưu địa chỉ IP để kiểm tra tần suất gửi
}, {
  timestamps: true // Tự động tạo `createdAt` và `updatedAt`
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

module.exports = ContactMessage;
