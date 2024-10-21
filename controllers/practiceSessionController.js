const PracticeSession = require('../models/PracticeSession');
//Lấy các buổi tập luyện của câu lạc bộ
exports.getPracticeSessionsByClub = async (req, res) => {
  try {
    const {clubId} = req.params;
    const {page = 1, limit = 20 } = req.query; // Lấy các tham số từ query params

    if (!clubId) {
      return res.status(400).json({ message: 'clubId là bắt buộc' });
    }

    // Tính tổng số buổi tập luyện của câu lạc bộ
    const total = await PracticeSession.countDocuments({ clubId });

    // Lấy danh sách buổi tập luyện theo clubId với phân trang và sắp xếp
    const sessions = await PracticeSession.find({ clubId })
      .sort({ practiceDate: -1 }) // Sắp xếp theo ngày tập luyện từ gần đây nhất về xa nhất
      .limit(limit * 1) // Giới hạn số lượng buổi tập luyện mỗi trang
      .skip((page - 1) * limit) // Bỏ qua các buổi tập luyện của trang trước đó
      .populate('createdBy lastUpdatedBy'); // Nếu cần populate các trường liên kết

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      totalItems: total,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách buổi tập luyện:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách buổi tập luyện' });
  }
};



// Tạo mới buổi tập luyện
exports.createPracticeSession = async (req, res) => {
  try {
    // Lấy các thông tin cần thiết từ req.body và req.user (lấy từ token)
    
    const { name, practiceDate, notes, clubId } = req.body;
    const createdBy = req.user.id;  // Lấy userId từ token

    // Tạo một buổi tập luyện mới
    const newPracticeSession = new PracticeSession({
      name,
      practiceDate,
      notes,
      clubId,
      createdBy,  // Thêm người tạo từ token
      lastUpdatedBy: createdBy,  // Người cập nhật cuối cùng cũng là người tạo ban đầu
    });

    // Lưu buổi tập luyện mới vào cơ sở dữ liệu
    const savedPracticeSession = await newPracticeSession.save();
    res.status(201).json(savedPracticeSession);
  } catch (err) {
    console.error("Error creating practice session:", err);
    res.status(400).json({ message: err.message });
  }
};

// Lấy tất cả buổi tập luyện
exports.getAllPracticeSessions = async (req, res) => {
  try {
    const practiceSessions = await PracticeSession.find().populate('clubId').populate('createdBy').populate('lastUpdatedBy').populate('matches');
    res.status(200).json(practiceSessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy buổi tập luyện theo ID
exports.getPracticeSessionById = async (req, res) => {
  try {
    const practiceSession = await PracticeSession.findById(req.params.id).populate('clubId').populate('createdBy').populate('lastUpdatedBy').populate('matches');
    if (!practiceSession) return res.status(404).json({ message: 'Practice Session not found' });
    res.status(200).json(practiceSession);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật buổi tập luyện theo ID
exports.updatePracticeSessionById = async (req, res) => {
  try {
    const updatedPracticeSession = await PracticeSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPracticeSession) return res.status(404).json({ message: 'Practice Session not found' });
    res.status(200).json(updatedPracticeSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa buổi tập luyện theo ID
exports.deletePracticeSessionById = async (req, res) => {
  try {
    const deletedPracticeSession = await PracticeSession.findByIdAndDelete(req.params.id);
    if (!deletedPracticeSession) return res.status(404).json({ message: 'Practice Session not found' });
    res.status(200).json({ message: 'Practice Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
