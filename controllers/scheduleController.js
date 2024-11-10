const Schedule = require('../models/Schedule')
const mongoose = require('mongoose');0
const Class = require('../models/Class')
const User = require('../models/User')

// Lấy danh sách lịch giảng dạy với phân trang, tìm kiếm theo tên giáo viên hoặc lớp và lọc theo khoảng thời gian
exports.getSchedules = async (req, res) => {
    const { page = 1, limit = 10, search = '', startDate, endDate } = req.query
    const skip = (page - 1) * limit

    try {
        // Tạo pipeline để tìm kiếm và phân trang
        const pipeline = []

        // Kết hợp dữ liệu từ model Class và User
        pipeline.push(
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'classInfo'
                }
            },
            {
                $unwind: '$classInfo' // Giải nén kết quả để truy cập classInfo trực tiếp
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo' // Giải nén kết quả để truy cập userInfo trực tiếp
            }
        )

        // Áp dụng điều kiện tìm kiếm nếu có từ khóa
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'classInfo.name': { $regex: search, $options: 'i' } },
                        { 'userInfo.fullName': { $regex: search, $options: 'i' } }
                    ]
                }
            })
        }

        // Áp dụng điều kiện lọc theo khoảng thời gian nếu có
        if (startDate || endDate) {
            const dateQuery = {}
            if (startDate) dateQuery.$gte = new Date(startDate)
            if (endDate) dateQuery.$lte = new Date(endDate)
            pipeline.push({ $match: { date: dateQuery } })
        }

        // Dùng $project để chỉ lấy các trường cần thiết
        pipeline.push({
            $project: {
                classId: '$classInfo._id',
                className: '$classInfo.name',
                userId: '$userInfo._id',
                userName: '$userInfo.fullName',
                date: 1,
                startHour: 1,
                startMinute: 1,
                duration: 1,
                status: 1,
                note: 1,
                createdAt: 1
            }
        })

        // Đếm tổng số bản ghi
        const countPipeline = [...pipeline, { $count: 'total' }]
        const countResult = await Schedule.aggregate(countPipeline)
        const totalSchedules = countResult[0]?.total || 0

        // Thêm bước phân trang
        pipeline.push(
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        )

        // Thực thi truy vấn với phân trang và điều kiện lọc
        const schedules = await Schedule.aggregate(pipeline)

        res.status(200).json({
            success: true,
            totalSchedules,
            totalPages: Math.ceil(totalSchedules / limit),
            currentPage: page,
            schedules
        })
    } catch (error) {
        console.error('Error getting schedules:', error)
        res.status(500).json({ success: false, message: 'Error getting schedules', error })
    }
}

//

exports.getTeachingCards = async (req, res) => {
    const { page = 1, limit = 12 } = req.query
    const skip = (page - 1) * limit
    const today = new Date()
    const userId = new mongoose.Types.ObjectId(req.user.id) // Chuyển `createdBy` thành ObjectId

    try {
        const pipeline = [
            {
                $match: {
                    date: { $lte: today }, // Chỉ lấy các phiếu từ hôm nay về trước
                    $expr: { $eq: ['$userId', userId] } // Sử dụng $expr cho phép so sánh chính xác ObjectId
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'classInfo'
                }
            },
            { $unwind: '$classInfo' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    classId: 1,
                    userId: 1,
                    date: 1,
                    startHour: 1,
                    startMinute: 1,
                    duration: 1,
                    status: 1,
                    className: '$classInfo.name',
                    userName: '$userInfo.fullName'
                }
            },
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]

        const totalSchedules = await Schedule.countDocuments({
            date: { $lte: today },
            userId: userId
        })
        const schedules = await Schedule.aggregate(pipeline)

        res.status(200).json({
            success: true,
            totalSchedules,
            totalPages: Math.ceil(totalSchedules / limit),
            currentPage: page,
            schedules
        })
    } catch (error) {
        console.log('getTeachingCards', error)
        res.status(500).json({ success: false, message: 'Error getting teaching cards', error })
    }
}



// Tạo mới lịch giảng dạy
exports.createSchedule = async (req, res) => {
    const { classId, userId, date, startHour, startMinute, duration, status, note } = req.body
    try {
        const schedule = new Schedule({
            classId,
            userId,
            date,
            startHour,
            startMinute,
            duration,
            status,
            note,
            createdBy: req.user.id
        })
        await schedule.save()

        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            schedule
        })
    } catch (error) {
        console.error('Error creating schedule:', error)
        res.status(500).json({ success: false, message: 'Error creating schedule', error })
    }
}

// Cập nhật lịch giảng dạy
exports.updateSchedule = async (req, res) => {
    const { id } = req.params
    const { classId, userId, date, startHour, startMinute, duration, status, note } = req.body
    try {
        const schedule = await Schedule.findById(id)
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' })
        }

        // Cập nhật thông tin lịch giảng dạy
        schedule.classId = classId
        schedule.userId = userId
        schedule.date = date
        schedule.startHour = startHour
        schedule.startMinute = startMinute
        schedule.duration = duration
        schedule.status = status
        schedule.note = note

        await schedule.save()

        res.status(200).json({
            success: true,
            message: 'Schedule updated successfully',
            schedule
        })
    } catch (error) {
        console.error('Error updating schedule:', error)
        res.status(500).json({ success: false, message: 'Error updating schedule', error })
    }
}

// Xóa lịch giảng dạy
exports.deleteSchedule = async (req, res) => {
    const { id } = req.params
    try {
        const schedule = await Schedule.findByIdAndDelete(id)
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' })
        }

        res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting schedule:', error)
        res.status(500).json({ success: false, message: 'Error deleting schedule', error })
    }
}


// Lấy danh sách lớp học
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find().select('name')
        res.status(200).json({ success: true, classes })
    } catch (error) {
        console.error('Error getting classes:', error)
        res.status(500).json({ success: false, message: 'Error getting classes', error })
    }
}

// Lấy danh sách giáo viên
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ roles: 'teacher' }).select('fullName')
        res.status(200).json({ success: true, teachers })
    } catch (error) {
        console.error('Error getting teachers:', error)
        res.status(500).json({ success: false, message: 'Error getting teachers', error })
    }
}