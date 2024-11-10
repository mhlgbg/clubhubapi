const Class = require('../models/Class')
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');


// Lấy danh sách lớp học với phân trang và tìm kiếm
exports.getClasses = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (page - 1) * limit
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    try {
        const totalClasses = await Class.countDocuments(query)
        const classes = await Class.find(query)
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
            .skip(parseInt(skip))
            .limit(parseInt(limit))

        res.status(200).json({
            success: true,
            totalClasses,
            totalPages: Math.ceil(totalClasses / limit),
            currentPage: parseInt(page),
            classes
        })
    } catch (error) {
        console.error('Error getting classes:', error)
        res.status(500).json({ success: false, message: 'Error getting classes', error })
    }
}

// Tạo mới một lớp học
exports.createClass = async (req, res) => {
    const { name, startDate, endDate } = req.body
    const avatar = req.file ? 'uploads/avatars/' + req.file.filename : null

    try {
        const newClass = await Class.create({
            name,
            startDate,
            endDate,
            avatar
        })

        res.status(201).json({ success: true, message: 'Class created successfully', class: newClass })
    } catch (error) {
        console.error('Error creating class:', error)
        res.status(500).json({ success: false, message: 'Error creating class', error })
    }
}

// Cập nhật thông tin lớp học
exports.updateClass = async (req, res) => {
    const { id } = req.params
    const { name, startDate, endDate } = req.body
    const avatar = req.file ? 'uploads/avatars/' + req.file.filename : undefined

    try {
        const updatedData = { name, startDate, endDate }
        if (avatar) {
            updatedData.avatar = avatar
        }

        const updatedClass = await Class.findByIdAndUpdate(id, updatedData, { new: true })
        if (!updatedClass) {
            return res.status(404).json({ success: false, message: 'Class not found' })
        }

        res.status(200).json({ success: true, message: 'Class updated successfully', class: updatedClass })
    } catch (error) {
        console.error('Error updating class:', error)
        res.status(500).json({ success: false, message: 'Error updating class', error })
    }
}

// Xóa lớp học
exports.deleteClass = async (req, res) => {
    const { id } = req.params

    try {
        const deletedClass = await Class.findByIdAndDelete(id)
        if (!deletedClass) {
            return res.status(404).json({ success: false, message: 'Class not found' })
        }

        res.status(200).json({ success: true, message: 'Class deleted successfully' })
    } catch (error) {
        console.error('Error deleting class:', error)
        res.status(500).json({ success: false, message: 'Error deleting class', error })
    }
}


// Thêm học viên vào lớp dựa trên email
exports.addStudentToClass = async (req, res) => {
    const { email, classId, joinDate, endDate} = req.body;

    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Kiểm tra xem học viên đã tồn tại trong lớp chưa
        const existingEnrollment = await Enrollment.findOne({ userId: user._id, classId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'Student is already enrolled in this class' });
        }

        // Thêm học viên vào lớp với joinDate và endDate
        const enrollment = new Enrollment({
            userId: user._id,
            classId,
            status: 'active',
            joinDate: joinDate ? new Date(joinDate) : new Date(), // Nếu không có joinDate thì dùng ngày hiện tại
            endDate: endDate ? new Date(endDate) : null, // Nếu không có endDate thì là null
            createdBy: req.user.id // assuming req.user contains authenticated user info
        });
        await enrollment.save();

        res.status(201).json({
            success: true,
            message: 'Student added to class successfully',
            student: {
                userId: user._id,
                fullName: user.fullName,
                email: user.email,
                status: enrollment.status,
                joinDate: enrollment.joinDate,
                endDate: enrollment.endDate
            }
        });
    } catch (error) {
        console.error('Error adding student to class:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

// Lấy danh sách học viên trong một lớp
exports.getClassStudents = async (req, res) => {
    const { classId } = req.params;

    try {
        // Tìm tất cả các học viên trong lớp
        const enrollments = await Enrollment.find({ classId })
            .populate('userId', 'fullName email') // Populate thông tin người dùng
            .select('status joinDate endDate'); // Chỉ lấy các trường cần thiết

        // Định dạng dữ liệu trả về
        const students = enrollments.map(enrollment => ({
            userId: enrollment.userId._id,
            fullName: enrollment.userId.fullName,
            email: enrollment.userId.email,
            status: enrollment.status,
            joinDate: enrollment.joinDate,
            endDate: enrollment.endDate,
        }));

        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};


exports.deleteStudentOfClass = async (req, res) => {
    const { userId, classId } = req.params;
    console.log('deleteStudentOfClass');
    try {
        // Tìm và xóa bản ghi enrollment có userId và classId
        const deletedEnrollment = await Enrollment.findOneAndDelete({
            userId: userId,
            classId: classId
        });

        if (!deletedEnrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found or already deleted'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student successfully removed from class',
            deletedEnrollment
        });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting enrollment',
            error
        });
    }
};