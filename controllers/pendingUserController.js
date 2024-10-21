const PendingUser = require('../models/PendingUser');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendActivationEmail } = require('./utils/emailService');

// Controller để đăng ký người dùng mới
exports.registerPendingUser = async (req, res) => {
    try {
        const { email, password, fullName, phoneNumber } = req.body;

        // Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
        const existingPendingUser = await PendingUser.findOne({ email });
        if (existingPendingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống.' });
        }

        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Tạo mã kích hoạt ngẫu nhiên và đặt ngày hết hạn
        const activationToken = crypto.randomBytes(20).toString('hex');
        const tokenExpirationDate = new Date();
        tokenExpirationDate.setHours(tokenExpirationDate.getHours() + 72); // Token hết hạn sau 72 giờ

        // Tạo mới pendingUser và lưu vào cơ sở dữ liệu
        const newPendingUser = new PendingUser({
            email,
            passwordHash,
            fullName,
            phoneNumber: phoneNumber || null, // Số điện thoại tùy chọn
            activationToken,
            tokenExpirationDate,
            status: 'pending', // Trạng thái mặc định là 'pending'
            roles: 'user', // Vai trò mặc định là 'user'
        });

        await newPendingUser.save();

        // Tạo link kích hoạt
        const activationLink = `${req.protocol}://${req.get('host')}/api/pending-users/activate/${activationToken}`;

        // Gửi email kích hoạt
        await sendActivationEmail(email, fullName, activationLink);

        // Gửi phản hồi thành công
        res.status(201).json({
            message: 'Đăng ký thành công. Hãy kiểm tra email để kích hoạt tài khoản của bạn.',
        });
    } catch (error) {
        console.error('Lỗi khi đăng ký pending user:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra. Vui lòng thử lại sau.' });
    }
};


/*exports.activateUser = async (req, res) => {
    try {
        const { token } = req.params;

        // Tìm PendingUser theo mã kích hoạt
        const pendingUser = await PendingUser.findOne({ activationToken: token, tokenExpirationDate: { $gte: Date.now() } });

        if (!pendingUser) {
            return res.status(400).json({ message: 'Mã kích hoạt không hợp lệ hoặc đã hết hạn.' });
        }

        // Kiểm tra xem người dùng đã có trong hệ thống chưa
        const existingUser = await User.findOne({ email: pendingUser.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Tài khoản đã được kích hoạt.' });
        }

        // Tạo tài khoản mới từ thông tin của PendingUser
        const newUser = new User({
            username: pendingUser.email, // Sử dụng email làm username
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            phoneNumber: pendingUser.phoneNumber,
            password: pendingUser.passwordHash, // Sử dụng password đã hash
            status: 'approved', // Tài khoản được duyệt ngay sau khi kích hoạt
            role: 'user',
        });

        await newUser.save();

        // Xóa PendingUser sau khi tài khoản được kích hoạt
        await PendingUser.deleteOne({ _id: pendingUser._id });

        res.status(200).json({ message: 'Tài khoản đã được kích hoạt thành công.' });
    } catch (error) {
        console.error('Lỗi khi kích hoạt tài khoản:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi kích hoạt tài khoản.' });
    }
};*/
exports.activateUser = async (req, res) => {
    try {
        const { token } = req.params;

        // Tìm PendingUser theo mã kích hoạt
        const pendingUser = await PendingUser.findOne({ activationToken: token, tokenExpirationDate: { $gte: Date.now() } });

        if (!pendingUser) {
            // Nếu mã không hợp lệ hoặc hết hạn, chuyển hướng về một trang thông báo lỗi
            const url = `${process.env.URL_WEB}/notification/activation-failed`; // Không có dấu {}
            console.log("activateUser: ", url);
            return res.redirect(url); // Chuyển hướng đến URL báo lỗi
        }

        // Kiểm tra xem người dùng đã có trong hệ thống chưa
        const existingUser = await User.findOne({ email: pendingUser.email });
        if (existingUser) {
            // Nếu tài khoản đã được kích hoạt, chuyển hướng về trang thông báo
            const url = `${process.env.URL_WEB}/notification/already-activated`; // Không có dấu {}
            console.log("activateUser: ", url);
            return res.redirect(url); // Chuyển hướng đến trang thông báo đã kích hoạt
        }

        // Tạo tài khoản mới từ thông tin của PendingUser
        const newUser = new User({
            username: pendingUser.email, // Sử dụng email làm username
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            phoneNumber: pendingUser.phoneNumber,
            password: pendingUser.passwordHash, // Sử dụng password đã hash
            status: 'approved', // Tài khoản được duyệt ngay sau khi kích hoạt
            roles: ['user'],
        });

        await newUser.save();

        // Xóa PendingUser sau khi tài khoản được kích hoạt
        await PendingUser.deleteOne({ _id: pendingUser._id });

        // Chuyển hướng về một trang thông báo thành công
        const url = `${process.env.URL_WEB}/notification/activation-success`; // Không có dấu {}
        console.log("activateUser: ", url);
        res.redirect(url); // Chuyển hướng đến URL thành công
    } catch (error) {
        console.error('Lỗi khi kích hoạt tài khoản:', error);        
        const url = `${process.env.URL_WEB}/notification/activation-error`; // Không có dấu {}
        console.log("activateUser: ", url);
        res.status(500).redirect(url); // Chuyển hướng đến URL báo lỗi chung
    }
};

