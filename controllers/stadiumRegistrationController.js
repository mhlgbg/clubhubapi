const StadiumRegistration = require('../models/StadiumRegistration'); // Mô hình đăng ký sân vận động
const StadiumManagement = require('../models/StadiumManagement'); // Mô hình quản lý sân vận động
const User = require('../models/User'); // Mô hình User
const bcrypt = require('bcrypt');

const { sendWelcomeStadiumEmail, sendWelcomeStadiumEmailExistingUser} = require('./utils/emailService');

// Controller cho đăng ký sân vận động
exports.registerStadium = async (req, res) => {
    try {
        const { sportId, stadiumName, avatar, location, managerName, managerEmail, managerPhoneNumber } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!sportId || !stadiumName || !managerName || !managerEmail || !managerPhoneNumber) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
        }
        const existingStadium = await StadiumManagement.findOne({ stadiumName });
        if (existingStadium) {
            return res.status(400).json({ message: 'Tên sân đã tồn tại. Vui lòng chọn tên khác.' });
        }

        // Upload avatar nếu có
        let avatarUrl = avatar || '';

        // Tạo bản ghi mới trong cơ sở dữ liệu cho đăng ký sân
        const newStadiumRegistration = new StadiumRegistration({
            sportId,
            stadiumName,
            avatar: avatarUrl,
            location,
            managerName,
            managerEmail,
            managerPhoneNumber,
        });

        const savedStadiumRegistration = await newStadiumRegistration.save();

        // 1. Kiểm tra xem đã có user với email của manager hay chưa
        let user = await User.findOne({ email: managerEmail });

        if (!user) {
            // Sinh mật khẩu ngẫu nhiên (Stadium@ + 3 con số)
            const randomPassword = `Stadium@${Math.floor(100 + Math.random() * 900)}`;
            const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash mật khẩu trước khi lưu

            // Tạo user mới
            user = new User({
                username: managerEmail,
                password: hashedPassword, // Lưu mật khẩu đã hash
                email: managerEmail,
                phoneNumber: managerPhoneNumber,
                fullName: managerName,
                role: 'manager'
            });
            await user.save();

            // Gửi email chào mừng cho người dùng mới với mật khẩu ngẫu nhiên
            await sendWelcomeStadiumEmail(managerEmail, managerName, randomPassword, stadiumName);
        } else {
            // Gửi email chào mừng cho người dùng đã tồn tại
            await sendWelcomeStadiumEmailExistingUser(managerEmail, managerName, stadiumName);
        }

        // 2. Tạo bản ghi trong bảng StadiumManagement
        const newStadiumManagement = new StadiumManagement({
            sportId,
            stadiumName,
            address: location,
            contactPhone: managerPhoneNumber,
            avatar: avatarUrl,
            representativeName: managerName,
            managers: [user._id], // Thêm user vừa tạo làm manager
            createdAt: Date.now(),
            updatedAt: Date.now(),
            updatedBy: user._id, // Quản lý sân được tạo bởi chính người dùng này
        });

        const savedStadiumManagement = await newStadiumManagement.save();

        res.status(201).json({ 
            message: 'Đăng ký sân và tạo tài khoản quản lý thành công!',
            stadiumManagement: savedStadiumManagement
        });
    } catch (error) {
        console.error('Lỗi khi đăng ký sân:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đăng ký, vui lòng thử lại sau.' });
    }
};
