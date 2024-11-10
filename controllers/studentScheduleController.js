const Schedule = require('../models/Schedule'); // Model lịch học
const Enrollment = require('../models/Enrollment');


exports.getSchedulesOfStudent = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ token đã xác thực
        const { viewCondition, searchQuery, page = 1, limit = 12 } = req.query;

        // Tìm các lớp mà sinh viên đã đăng ký và đang active
        const activeEnrollments = await Enrollment.find({ userId, status: 'active' }).select('classId');
        const classIds = activeEnrollments.map(enrollment => enrollment.classId);

        // Điều kiện lọc lịch học
        const filterConditions = { classId: { $in: classIds } };

        if (viewCondition === 'future') {
            filterConditions.date = { $gte: new Date() }; // Lịch học tương lai
        } else if (viewCondition === 'past') {
            filterConditions.date = { $lt: new Date() }; // Lịch học quá khứ
        }

        // Điều kiện tìm kiếm theo tên lớp hoặc thầy giáo
        if (searchQuery) {
            filterConditions.$or = [
                { className: { $regex: searchQuery, $options: 'i' } },
                { teacherName: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Phân trang và sắp xếp theo ngày, đồng thời populate tên thầy giáo và tên lớp
        const schedules = await Schedule.find(filterConditions)
            .populate('userId', 'fullName') // Populate tên thầy giáo
            .populate('classId', 'name') // Populate tên lớp
            .sort({ date: viewCondition === 'future' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Thêm thông tin điểm danh, số nhiệm vụ và số nhận xét cho mỗi lịch học
        const schedulesWithAdditionalInfo = schedules.map(schedule => {
            // Tìm điểm danh của sinh viên trong danh sách điểm danh của lịch học
            const attendanceRecord = schedule.attendance.find(
                record => record.userId.toString() === userId
            );

            // Đếm số nhiệm vụ liên quan đến sinh viên
            const taskCount = schedule.tasks.length + 
                schedule.individualTasks.filter(task => task.userId.toString() === userId).length;

            // Đếm số nhận xét dành riêng cho sinh viên
            const commentCount = schedule.privateMessages.filter(
                message => message.userId.toString() === userId
            ).length;

            return {
                ...schedule._doc,
                teacherName: schedule.userId ? schedule.userId.fullName : "Unknown",
                className: schedule.classId ? schedule.classId.name : "Unknown",
                attendanceStatus: attendanceRecord ? attendanceRecord.status : 'no_attendance',
                taskCount,       // Số nhiệm vụ
                commentCount     // Số nhận xét
            };
        });

        // Tổng số trang
        const totalSchedules = await Schedule.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalSchedules / limit);

        res.status(200).json({ schedules: schedulesWithAdditionalInfo, totalPages });
    } catch (error) {
        console.log('getSchedulesOfStudent', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch học.' });
    }
};
