const UserGrade = require('../models/UserGrade');

const mongoose = require('mongoose');

exports.getUserGrades = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id); // Sử dụng 'new' để tạo ObjectId
        const { page = 1, limit = 10 } = req.query;

        // Tìm phiếu điểm của người dùng và sắp xếp theo ngày đánh giá (gần nhất trước)
        const grades = await UserGrade.find({userId})
            .sort({ assessmentDate: -1 }) // Sắp xếp từ gần đây nhất về quá khứ
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        console.log('getUserGrades', grades);

        // Tính tổng số trang
        const totalGrades = await UserGrade.countDocuments({ userId });
        const totalPages = Math.ceil(totalGrades / limit);

        res.status(200).json({ grades, totalPages });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu điểm:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách phiếu điểm.' });
    }
};