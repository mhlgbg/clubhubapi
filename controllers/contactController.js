// controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const axios = require('axios');

exports.sendMessage = async (req, res) => {
  const { name, email, phone, company, address, message, captchaToken } = req.body;
  console.log('sendMessage');

  // Xác thực CAPTCHA với Google reCAPTCHA
  try {
    const captchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=6Lc402sqAAAAAH2y0pm4zo0TVnlrDcTYbMkfmPM5&response=${captchaToken}`
    );
    if (!captchaResponse.data.success) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying CAPTCHA' });
  }

  // Kiểm tra tần suất gửi
  const ipAddress = req.ip; // Lấy địa chỉ IP của người gửi
  const lastMessage = await ContactMessage.findOne({ ipAddress }).sort({ createdAt: -1 });

  if (lastMessage && (Date.now() - lastMessage.createdAt.getTime()) < 60000) {
    return res.status(429).json({ message: 'You can only send a message once every minute.' });
  }

  // Lưu tin nhắn liên hệ
  const newMessage = new ContactMessage({
    name,
    email,
    phone,
    company,
    address,
    message,
    ipAddress,
  });

  try {
    
    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Lấy các contact message với phân trang và sắp xếp theo thời gian
exports.getContactMessages = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const totalMessages = await ContactMessage.countDocuments();
      const messages = await ContactMessage.find()
        .sort({ createdAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      res.status(200).json({
        messages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: parseInt(page),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching contact messages', error });
    }
  };