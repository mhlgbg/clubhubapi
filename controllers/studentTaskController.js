const UserTask = require('../models/UserTask');
const Task = require('../models/Task');
const UserTaskComment = require('../models/UserTaskComment');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.getTaskDetails = async (req, res) => {
    try {
        const { userTaskId } = req.params;

        // Lấy chi tiết của nhiệm vụ
        const task = await UserTask.findById(userTaskId).populate('taskId', 'title description dueDate');
        if (!task) {
            return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ.' });
        }

        // Lấy danh sách comment và populate userCommentId để có tên người nhận xét
        const comments = await UserTaskComment.find({ userTaskId })
            .populate('userCommentId', 'fullName') // Populate để lấy tên người nhận xét
            .sort({ createdAt: -1}); // Sắp xếp theo thời điểm nhận xét, mới nhất trước
        console.error('getTaskDetails comments: ', comments);

        res.status(200).json({ 
            task, 
            comments: comments.map(comment => ({
                ...comment._doc,
                timestamp: comment.timestamp ? comment.timestamp.toISOString() : null
                })) 
            });
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết nhiệm vụ:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết nhiệm vụ.' });
    }
};


exports.getStudentTasks = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ token đã xác thực
        const { page = 1, limit = 10 } = req.query; // Phân trang với giá trị mặc định

        // Lọc và sắp xếp nhiệm vụ của sinh viên theo dueDate
        const filterConditions = { userId };

        const tasks = await UserTask.find(filterConditions)
            .populate('taskId', 'title description')
            .sort({ dueDate: 1 }) // Sắp xếp dueDate: tương lai, hiện tại, quá khứ
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Tính tổng số trang
        const totalTasks = await UserTask.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalTasks / limit);

        res.status(200).json({ tasks, totalPages });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhiệm vụ:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách nhiệm vụ.' });
    }
};




// Cấu hình multer để xử lý file upload (dành cho loại image)

exports.submitComment = async (req, res) => {
    console.error('submitComment req.body: ', req.body);
    console.error('submitComment req.params: ', req.params);

    try {
        const { userTaskId } = req.params;
        const { contentType } = req.body;

        let content = req.body.content;

        if (contentType === 'image' && req.file) {
            content = req.file.path; // Lưu đường dẫn ảnh đã upload
        }

        const newComment = new UserTaskComment({
            userTaskId: userTaskId,
            userCommentId: req.user.id,
            contentType,
            content,
            timestamp: new Date()
        });

        await newComment.save();

        res.status(201).json({ message: 'Nộp bài thành công.' });
    } catch (error) {
        console.error('Lỗi khi nộp nhận xét:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi nộp nhận xét.' });
    }
};
