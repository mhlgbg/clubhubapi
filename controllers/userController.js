const User = require('../models/User'); // Đảm bảo đúng đường dẫn tới model User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const crypto = require('crypto');

const { sendResetPasswordEmail } = require('./utils/emailService');

const multer = require('multer');
const path = require('path');

// Cấu hình multer cho việc upload ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// PUT /users/upload-avatar
exports.uploadAvatar = async (req, res) => {
    console.log("uploadAvatar: ", req.user);
    try {
        const user = await User.findById(req.user.id);
        user.avatar = `uploads/avatars/${req.file.filename}`;
        console.log("user.avatar: ", user.avatar);
        await user.save();
        res.json({ message: 'Avatar uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading avatar', error });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Tạo người dùng mới
// Tạo người dùng mới
exports.createUser = async (req, res) => {
    try {
        const { username, fullName, password, email, phoneNumber, roles, status } = req.body;
        const defaultAvatar = 'uploads/avatars/150.jpg';
        const createdBy = req.user.id;

        const hashedPassword = await bcrypt.hash(password, 10); // Hash mật khẩu trước khi lưu

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            phoneNumber,
            roles,
            fullName,
            status,            
            createdBy,
            avatar: defaultAvatar, // Avatar mặc định
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, fullName, email, phoneNumber, roles, status } = req.body;

        const updateData = {
            username,
            fullName,
            email,
            phoneNumber,
            roles,
            status,
        };

        if (req.body.password) {
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
/*
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
};
*/
exports.updateUserRoles = async (req, res) => {
    try {
        const { userId, roles } = req.body; // Lấy danh sách các roles từ request body
        const user = await User.findByIdAndUpdate(userId, { roles }, { new: true }); // Cập nhật mảng roles
        res.status(200).json({ message: "User roles updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user roles', error });
    }
};


// Hàm khác nếu cần
exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("req.body: ", req.body)
      // Tìm user theo username
      const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Kiểm tra password
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.error('process.env.JWT_SECRET:', process.env.JWT_SECRET);

  
      // Tạo JWT token
      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          roles: user.roles, // Thêm role vào token
          avatar: user.avatar,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      //console.log("Login token: ", token)
      // Trả về token
      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  

// API để yêu cầu đặt lại mật khẩu
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại.' });
        }

        // Tạo token ngẫu nhiên và đặt thời gian hết hạn (1 giờ)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 giờ

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Gửi email cho người dùng
        const resetLink = `${process.env.URL_WEB}/#/reset-password/${resetToken}`;
        await sendResetPasswordEmail(user.email, resetLink);

        res.json({ message: 'Link đặt lại mật khẩu đã được gửi qua email.' });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra.' });
    }
};

// API để xác nhận link đặt lại mật khẩu và đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }

        // Cập nhật mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Mật khẩu đã được thay đổi thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi đặt lại mật khẩu.' });
    }
};

exports.changePassword = async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
  
      // Tìm user theo userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Kiểm tra mật khẩu hiện tại
      const isMatch = await bcrypt.compare(currentPassword, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
  
      // Mã hóa mật khẩu mới
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Cập nhật mật khẩu mới
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // GET /users/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

// PUT /users/profile
exports.updateProfile = async (req, res) => {
    console.log("uploadAvatar: ", req.body);

    const { fullName, phoneNumber } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, phoneNumber },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

//g
// Controller lấy danh sách người dùng có tìm kiếm và phân trang
exports.getUsersPaginated = async (req, res) => {
    try {
      // Lấy các tham số từ query
      const { page = 1, limit = 20, search = '' } = req.query;
  
      // Tính toán skip và limit để phân trang
      const skip = (page - 1) * limit;
  
      // Tạo đối tượng điều kiện tìm kiếm
      let searchCondition = {};
  
      if (search) {
        searchCondition = {
          $or: [
            { username: { $regex: search, $options: 'i' } }, // Tìm kiếm theo username (không phân biệt hoa thường)
            { email: { $regex: search, $options: 'i' } },    // Tìm kiếm theo email (không phân biệt hoa thường)
          ],
        };
      }
  
      // Tìm và phân trang người dùng
      const users = await User.find(searchCondition)
        .skip(skip)
        .limit(parseInt(limit))
        .exec();
  
      // Đếm tổng số lượng người dùng để tính tổng số trang
      const totalUsers = await User.countDocuments(searchCondition);
      const totalPages = Math.ceil(totalUsers / limit);
  
      // Trả về danh sách người dùng, số trang và trang hiện tại
      res.status(200).json({
        users,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng.' });
    }
  };