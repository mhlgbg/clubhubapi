const Log = require('../models/Log'); // Đường dẫn đến file model Log

// Hàm để ghi log
exports.createLog = async (req, res) => {
  console.log("createLog", req.body);
  try {
      const { sessionId, visitedUrl } = req.body;

      // Kiểm tra sessionId và visitedUrl
      if (!sessionId || !visitedUrl) {
          return res.status(400).json({ message: 'sessionId và visitedUrl là bắt buộc' });
      }

      const ipAddress = req.headers['x-forwarded-for'] || req.ip; // Lấy IP từ request
      const userAgent = req.headers['user-agent'] || 'Unknown'; // Lấy thông tin user-agent

      // Tạo log mới
      const newLog = new Log({
          sessionId,
          ipAddress,
          userAgent,
          visitedUrl
      });

      // Lưu log vào cơ sở dữ liệu
      await newLog.save();
      res.status(201).json({ message: 'Log created successfully', log: newLog });
  } catch (error) {
    console.log("createLog error", error);
      console.error('Error creating log:', error);
      res.status(500).json({ message: 'Error creating log', error });
  }
};

// Hàm để lấy tất cả các log (có thể phân trang nếu cần)
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }); // Sắp xếp theo thời gian giảm dần
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy log' });
  }
};

// Hàm để lấy log theo username
exports.getLogsByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const logs = await Log.find({ username }).sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy log cho người dùng' });
  }
};
