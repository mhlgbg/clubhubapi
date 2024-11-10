const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const UserGrade = require('../models/UserGrade');
const UserComment = require('../models/UserComment');
const UserTask = require('../models/UserTask');

// Lấy thông tin báo cáo buổi học
/*exports.getClassReport = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const report = await Schedule.findById(scheduleId)
            .populate('userId', 'fullName')
            .populate('classId', 'name')
            .populate('tasks.taskId', 'title');
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.status(200).json({ success: true, report });
    } catch (error) {
        console.error('Error fetching class report:', error);
        res.status(500).json({ success: false, message: 'Error fetching class report' });
    }
};*/
exports.markScheduleAsCompleted = async (req, res) => {
    console.log('markScheduleAsCompleted Enter');

    const { scheduleId } = req.params;
    console.log('markScheduleAsCompleted req.params', req.params);

    try {
        // Fetch schedule by ID
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        // Delete existing records with the same sourceId (scheduleId)
        await UserGrade.deleteMany({ sourceId: scheduleId });
        await UserComment.deleteMany({ sourceId: scheduleId });
        await UserTask.deleteMany({ sourceId: scheduleId });

        // Fetch active students from Enrollment for the given classId
        const activeEnrollments = await Enrollment.find({
            classId: schedule.classId,
            status: 'active' // Assuming there's a status field to check active enrollments
        });

        // Extract userIds of active students as strings
        const activeStudentIds = activeEnrollments.map(enrollment => enrollment.userId.toString());
        console.log('markScheduleAsCompleted activeStudentIds', activeStudentIds);

        // Insert new UserTask records from tasks for each active student
        const taskRecords = schedule.tasks.flatMap(task =>
            activeStudentIds.map(userId => ({
                userId: userId, // Convert ObjectId to string
                taskId: task.taskId, // Convert ObjectId to string
                source: 'classroom',
                sourceId: scheduleId.toString(), // Convert ObjectId to string
                dueDate: task.dueDate,
                score: null,
                teacherComment: '',
                approvalTimestamp: null,
                approverId: null,
                timestamp: new Date()
            }))
        );
        console.log('markScheduleAsCompleted taskRecords', taskRecords);

        // Insert new UserTask records from individualTasks
        const individualTaskRecords = schedule.individualTasks.map(task => ({
            userId: task.userId, // Convert ObjectId to string
            taskId: task.taskId, // Convert ObjectId to string
            source: 'classroom',
            sourceId: scheduleId.toString(), // Convert ObjectId to string
            dueDate: task.dueDate,
            score: null,
            teacherComment: task.notes || '',
            approvalTimestamp: null,
            approverId: null,
            timestamp: new Date()
        }));
        await UserTask.insertMany([...taskRecords, ...individualTaskRecords]);
        console.log('markScheduleAsCompleted UserTask', UserTask);

        // Insert new UserGrade records
        const userGrades = schedule.grades.flatMap(grade =>
            grade.scores.map(score => ({
                userId: score.userId, // Convert ObjectId to string
                assessmentDate: schedule.date,
                assessmentName: grade.assessmentName,
                maxScore: grade.maxScore,
                score: score.score,
                comment: score.comment,
                source: 'classroom',
                sourceId: scheduleId.toString(), // Convert ObjectId to string
                timestamp: new Date()
            }))
        );
        await UserGrade.insertMany(userGrades);

        // Insert new UserComment records
        const userComments = schedule.privateMessages.map(message => ({
            userId: message.userId, // Convert ObjectId to string
            title: 'Private Message',
            messageContent: message.messageContent,
            readTimestamp: null,
            status: 'new',
            source: 'classroom',
            sourceId: scheduleId.toString(), // Convert ObjectId to string
            timestamp: new Date()
        }));
        await UserComment.insertMany(userComments);
        console.log('markScheduleAsCompleted userComments', userComments);

        // Update schedule status to completed
        schedule.status = 'completed';
        await schedule.save();

        res.status(200).json({ success: true, message: 'Schedule marked as completed', schedule });
    } catch (error) {
        console.error('Error marking schedule as completed:', error);
        res.status(500).json({ success: false, message: 'Error marking schedule as completed' });
    }
};

exports.getClassReport = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const report = await Schedule.findById(scheduleId)
            .populate('userId', 'fullName')
            .populate('classId', 'name')
            .populate('tasks.taskId', 'title');
        
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        
        const students = await Enrollment.find({ classId: report.classId, status: 'active' })
            .populate('userId', 'fullName')
            .select('userId');
        //console.log('getClassReport', students);
        const tasks = await Task.find().sort({ title: 1 }); // Lấy tất cả và sắp xếp theo title

        res.status(200).json({ success: true, report, students, tasks });
    } catch (error) {
        console.error('Error fetching class report:', error);
        res.status(500).json({ success: false, message: 'Error fetching class report' });
    }
};


// Thêm Teacher Note
exports.addTeacherNote = async (req, res) => {
    const { scheduleId } = req.params;
    const { title, content } = req.body;
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $push: { teacherNotes: { title, content } } },
            { new: true }
        );
        res.status(201).json({ success: true, teacherNotes: schedule.teacherNotes });
    } catch (error) {
        console.error('Error adding teacher note:', error);
        res.status(500).json({ success: false, message: 'Error adding teacher note' });
    }
};

// Cập nhật Teacher Note
exports.updateTeacherNote = async (req, res) => {
    const { scheduleId, noteId } = req.params;
    const { title, content } = req.body;
    try {
        const schedule = await Schedule.findOneAndUpdate(
            { _id: scheduleId, 'teacherNotes._id': noteId },
            { $set: { 'teacherNotes.$.title': title, 'teacherNotes.$.content': content } },
            { new: true }
        );
        res.status(200).json({ success: true, teacherNotes: schedule.teacherNotes });
    } catch (error) {
        console.error('Error updating teacher note:', error);
        res.status(500).json({ success: false, message: 'Error updating teacher note' });
    }
};

// Xóa Teacher Note
exports.deleteTeacherNote = async (req, res) => {
    const { scheduleId, noteId } = req.params;
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $pull: { teacherNotes: { _id: noteId } } },
            { new: true }
        );
        res.status(200).json({ success: true, teacherNotes: schedule.teacherNotes });
    } catch (error) {
        console.error('Error deleting teacher note:', error);
        res.status(500).json({ success: false, message: 'Error deleting teacher note' });
    }
};

// Thêm Task
exports.addTask = async (req, res) => {
    const { scheduleId } = req.params;
    const { taskId, dueDate } = req.body;
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $push: { tasks: { taskId, dueDate } } },
            { new: true }
        );
        res.status(201).json({ success: true, tasks: schedule.tasks });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ success: false, message: 'Error adding task' });
    }
};

// Xóa Task
exports.deleteTask = async (req, res) => {
    const { scheduleId, taskId } = req.params;
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $pull: { tasks: { taskId } } },
            { new: true }
        );
        res.status(200).json({ success: true, tasks: schedule.tasks });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Error deleting task' });
    }
};

// Lấy danh sách điểm danh
exports.getAttendance = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId).populate('attendance.userId', 'fullName');
        res.status(200).json({ success: true, attendance: schedule.attendance });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Error fetching attendance' });
    }
};

// Thêm điểm danh từ danh sách lớp
exports.addAttendance = async (req, res) => {
    const { scheduleId } = req.params;
    const { attendanceList } = req.body;
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $addToSet: { attendance: { $each: attendanceList } } },
            { new: true }
        );
        res.status(201).json({ success: true, attendance: schedule.attendance });
    } catch (error) {
        console.error('Error adding attendance:', error);
        res.status(500).json({ success: false, message: 'Error adding attendance' });
    }
};

// Cập nhật trạng thái điểm danh
exports.updateAttendanceStatus = async (req, res) => {
    const { scheduleId, userId } = req.params;
    const { status } = req.body;
    try {
        const schedule = await Schedule.findOneAndUpdate(
            { _id: scheduleId, 'attendance.userId': userId },
            { $set: { 'attendance.$.status': status } },
            { new: true }
        );
        res.status(200).json({ success: true, attendance: schedule.attendance });
    } catch (error) {
        console.error('Error updating attendance status:', error);
        res.status(500).json({ success: false, message: 'Error updating attendance status' });
    }
};

// Đóng buổi học và gửi thông tin
/*exports.completeClassReport = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findByIdAndUpdate(scheduleId, { status: 'completed' }, { new: true });
        res.status(200).json({ success: true, message: 'Class report completed', status: schedule.status });
    } catch (error) {
        console.error('Error completing class report:', error);
        res.status(500).json({ success: false, message: 'Error completing class report' });
    }
};*/
// Lấy danh sách các đánh giá điểm trong buổi học
// Controller: Lấy danh sách các đánh giá điểm trong buổi học
// Lấy điểm của một đầu điểm
exports.getGradeScores = async (req, res) => {
    const { scheduleId, assessmentName } = req.params;
    //console.log("getGradeScores", req.params);
    try {
        const schedule = await Schedule.findOne(
            { _id: scheduleId, 'grades.assessmentName': assessmentName },
            { 'grades.$': 1 } // Lấy chỉ một phần tử grades khớp với assessmentName
        ).populate({
            path: 'grades.scores.userId',
            select: 'fullName'
        });
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        // Kiểm tra dữ liệu trả về
        console.log("Fetched grade scores:", schedule.grades[0]);

        res.status(200).json({ success: true, grade: schedule.grades[0] });
    } catch (error) {
        console.error('Error fetching grade scores:', error);
        res.status(500).json({ success: false, message: 'Error fetching grade scores' });
    }
};


exports.getGrades = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId, 'grades')
            .populate({
                path: 'grades.scores.userId',
                select: 'fullName'  // Lấy trường fullName từ user
            });
        
        if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
        //console.log('getGrades ', schedule.grades);
        res.status(200).json({ success: true, grades: schedule.grades });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ success: false, message: 'Error fetching grades' });
    }
};


// Thêm một đánh giá điểm cho buổi học
exports.addGradeAssessment = async (req, res) => {
    const { scheduleId } = req.params;
    const { assessmentName, maxScore, scores } = req.body;

    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $push: { grades: { assessmentName, maxScore, scores: scores || []} } },
            { new: true }
        );
        res.status(201).json({ success: true, grades: schedule.grades });
    } catch (error) {
        console.error('Error adding grade assessment:', error);
        res.status(500).json({ success: false, message: 'Error adding grade assessment' });
    }
};

// Cập nhật điểm số cho một học sinh trong một đánh giá
/*
exports.updateGrade = async (req, res) => {
    const { scheduleId, assessmentName, userId } = req.params;
    const { score, comment } = req.body;

    try {
        const schedule = await Schedule.findOneAndUpdate(
            {
                _id: scheduleId,
                'grades.assessmentName': assessmentName,
                'grades.scores.userId': userId
            },
            {
                $set: {
                    'grades.$[grade].scores.$[score].score': score,
                    'grades.$[grade].scores.$[score].comment': comment
                }
            },
            {
                arrayFilters: [{ 'grade.assessmentName': assessmentName }, { 'score.userId': userId }],
                new: true
            }
        );
        res.status(200).json({ success: true, grades: schedule.grades });
    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(500).json({ success: false, message: 'Error updating grade' });
    }
};
*/
// Cập nhật điểm cho một đầu điểm
exports.updateGrade = async (req, res) => {
    const { scheduleId, assessmentName } = req.params;
    const { scores } = req.body;
    console.log('Updating grade for:', req.params.assessmentName);
    console.log('Scores to update:', scores); // Kiểm tra lại cấu trúc dữ liệu
    try {
        const schedule = await Schedule.findOneAndUpdate(
            { _id: scheduleId, 'grades.assessmentName': assessmentName },
            { $set: { 'grades.$.scores': scores } },
            { new: true }
        ).populate('grades.scores.userId', 'fullName');

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }
        res.status(200).json({ success: true, grades: schedule.grades });
    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(500).json({ success: false, message: 'Error updating grade' });
    }
};


exports.deleteGrade = async (req, res) => {
    const { scheduleId, assessmentName } = req.params;

    try {
        const schedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            { $pull: { grades: { assessmentName } } },
            { new: true }
        );
        res.status(200).json({ success: true, grades: schedule.grades });
    } catch (error) {
        console.error('Error deleting grade:', error);
        res.status(500).json({ success: false, message: 'Error deleting grade' });
    }
};

// Lấy danh sách học sinh đã điểm danh
exports.fetchAttendance = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId).populate('attendance.userId', 'fullName');
        res.status(200).json({ success: true, attendance: schedule.attendance });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Error fetching attendance' });
    }
};

// Lấy danh sách học sinh từ lớp và thêm vào danh sách điểm danh nếu chưa có
exports.fetchClassStudentsForAttendance = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId);
        const classId = schedule.classId;
        
        const enrolledStudents = await Enrollment.find({ classId, status: 'active' }).select('userId');
        const currentAttendance = schedule.attendance.map(att => att.userId.toString());

        // Thêm học sinh chưa có trong danh sách điểm danh với trạng thái no_attendance
        enrolledStudents.forEach(student => {
            if (!currentAttendance.includes(student.userId.toString())) {
                schedule.attendance.push({ userId: student.userId, status: 'no_attendance' });
            }
        });

        await schedule.save();
        res.status(200).json({ success: true, attendance: schedule.attendance });
    } catch (error) {
        console.error('Error fetching class students for attendance:', error);
        res.status(500).json({ success: false, message: 'Error fetching class students' });
    }
};

// Cập nhật trạng thái điểm danh
exports.updateAttendanceStatus = async (req, res) => {
    const { scheduleId, userId } = req.params;
    const { status } = req.body;
    try {
        const schedule = await Schedule.findOneAndUpdate(
            { _id: scheduleId, 'attendance.userId': userId },
            { $set: { 'attendance.$.status': status } },
            { new: true }
        ).populate('attendance.userId', 'fullName');
        res.status(200).json({ success: true, attendance: schedule.attendance });
    } catch (error) {
        console.error('Error updating attendance status:', error);
        res.status(500).json({ success: false, message: 'Error updating attendance status' });
    }
};

// Lấy danh sách học sinh chưa có điểm trong đầu điểm và thêm vào với điểm và nhận xét rỗng

exports.fetchStudentsForGrade = async (req, res) => {
    const { scheduleId, assessmentName } = req.params;

    try {
        // Tìm buổi học theo scheduleId và đầu điểm cần cập nhật
        const schedule = await Schedule.findById(scheduleId).populate('classId');
        if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

        // Lấy danh sách học sinh đã có trong bảng điểm của đầu điểm
        const existingUserIds = schedule.grades
            .find(grade => grade.assessmentName === assessmentName)?.scores.map(score => score.userId.toString()) || [];

        // Lấy danh sách học sinh của lớp nhưng chưa có trong đầu điểm
        const students = await Enrollment.find({ classId: schedule.classId, status: 'active' }).populate('userId', 'fullName');
        const newStudents = students.filter(student => !existingUserIds.includes(student.userId._id.toString()));

        // Thêm học sinh chưa có điểm vào đầu điểm với điểm và nhận xét rỗng
        const updatedScores = newStudents.map(student => ({
            userId: student.userId._id,
            score: null,
            comment: ''
        }));

        await Schedule.updateOne(
            { _id: scheduleId, 'grades.assessmentName': assessmentName },
            { $push: { 'grades.$.scores': { $each: updatedScores } } }
        );

        res.status(200).json({
            success: true,
            message: 'Students without grades have been added',
            newScores: updatedScores
        });
    } catch (error) {
        console.error('Error fetching students for grade:', error);
        res.status(500).json({ success: false, message: 'Error fetching students for grade' });
    }
};


// Lấy danh sách học sinh cho một đầu điểm
/*exports.fetchStudentsForGrade = async (req, res) => {
    const { scheduleId, assessmentName } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId).populate('classId');
        const students = await Enrollment.find({ classId: schedule.classId, status: 'active' })
            .populate('userId', 'fullName');
        
        const scores = students.map(student => ({
            userId: student.userId._id,
            fullName: student.userId.fullName,
            score: null,
            comment: ''
        }));
        
        await Schedule.findOneAndUpdate(
            { _id: scheduleId, 'grades.assessmentName': assessmentName },
            { $set: { 'grades.$.scores': scores } }
        );

        res.status(200).json({ success: true, grade: { assessmentName, scores } });
    } catch (error) {
        console.error('Error fetching students for grade:', error);
        res.status(500).json({ success: false, message: 'Error fetching students for grade' });
    }
};*/


exports.getIndividualTasks = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId).populate('individualTasks.userId', 'fullName').populate('individualTasks.taskId', 'title');
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        //console.log('getIndividualTasks ', schedule.individualTasks);
        res.status(200).json({ success: true, individualTasks: schedule.individualTasks });
    } catch (error) {
        console.error('Error fetching individual tasks:', error);
        res.status(500).json({ success: false, message: 'Error fetching individual tasks' });
    }
};

exports.addIndividualTask = async (req, res) => {
    //console.log('addIndividualTask ', req.body);
    const { scheduleId } = req.params;
    const { userId, taskId, dueDate, notes } = req.body;
    
    try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        // Thêm nhiệm vụ cá nhân vào danh sách
        schedule.individualTasks.push({ userId, taskId, dueDate, notes });
        await schedule.save();

        res.status(201).json({ success: true, message: 'Individual task added successfully', individualTasks: schedule.individualTasks });
    } catch (error) {
        console.error('Error adding individual task:', error);
        res.status(500).json({ success: false, message: 'Error adding individual task' });
    }
};

exports.deleteIndividualTask = async (req, res) => {
    const { scheduleId, taskId } = req.params;
    
    try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        // Tìm và xóa nhiệm vụ cá nhân
        schedule.individualTasks = schedule.individualTasks.filter(task => task._id.toString() !== taskId);
        await schedule.save();

        res.status(200).json({ success: true, message: 'Individual task deleted successfully', individualTasks: schedule.individualTasks });
    } catch (error) {
        console.error('Error deleting individual task:', error);
        res.status(500).json({ success: false, message: 'Error deleting individual task' });
    }
};


exports.updateIndividualTask = async (req, res) => {
    const { scheduleId, taskId } = req.params;
    const { dueDate, notes } = req.body;
    
    try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        // Tìm và cập nhật thông tin nhiệm vụ
        const task = schedule.individualTasks.id(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Individual task not found' });
        }

        if (dueDate) task.dueDate = dueDate;
        if (notes) task.notes = notes;
        
        await schedule.save();
        res.status(200).json({ success: true, message: 'Individual task updated successfully', individualTasks: schedule.individualTasks });
    } catch (error) {
        console.error('Error updating individual task:', error);
        res.status(500).json({ success: false, message: 'Error updating individual task' });
    }
};
exports.getIndividualMessages = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await Schedule.findById(scheduleId).populate('privateMessages.userId', 'fullName');
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        res.status(200).json({ success: true, privateMessages: schedule.privateMessages });
    } catch (error) {
        console.error('Error fetching individual messages:', error);
        res.status(500).json({ success: false, message: 'Error fetching individual messages' });
    }
};

// Thêm tin nhắn cá nhân cho học sinh
exports.addIndividualMessage = async (req, res) => {
    const { scheduleId } = req.params;
    const { userId, messageContent } = req.body;

    try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        schedule.privateMessages.push({ userId, messageContent });
        await schedule.save();

        res.status(201).json({ success: true, privateMessages: schedule.privateMessages });
    } catch (error) {
        console.error('Error adding individual message:', error);
        res.status(500).json({ success: false, message: 'Error adding individual message' });
    }
};



