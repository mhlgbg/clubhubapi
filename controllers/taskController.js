const Task = require('../models/Task'); // Import model Task
// Lấy danh all task của người dùng
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().select('title');
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
};
// Lấy danh sách Task (có phân trang và tìm kiếm)
exports.getTasks = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    try {
        const query = search
            ? { title: { $regex: search, $options: 'i' } }
            : {};

        // Đếm tổng số Task theo điều kiện tìm kiếm
        const totalTasks = await Task.countDocuments(query);

        // Lấy Task theo phân trang và điều kiện tìm kiếm
        // Lấy Task theo phân trang, tìm kiếm, và sắp xếp từ mới nhất
        const tasks = await Task.find(query)
            .sort({ createdAt: -1 }) // Sắp xếp theo createdAt từ mới nhất
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
            tasks,
        });
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ success: false, message: 'Error getting tasks', error });
    }
};

// Lấy thông tin một Task
exports.getTaskById = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Error getting task:', error);
        res.status(500).json({ success: false, message: 'Error getting task', error });
    }
};

// Tạo mới một Task
exports.createTask = async (req, res) => {
    const createdBy = req.user.id;  // Giả sử bạn đã xác thực và thêm `user` vào `req`

    const { title, description, difficultyLevel, tags } = req.body;
    try {
        const newTask = new Task({
            title,
            description,
            difficultyLevel,
            tags,
            createdBy,
        });
        await newTask.save();
        res.status(201).json({ success: true, message: 'Task created successfully', task: newTask });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Error creating task', error });
    }
};

// Cập nhật thông tin một Task
exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const updates = req.body;
    try {
        const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, message: 'Task updated successfully', task });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Error updating task', error });
    }
};

// Xóa một Task
exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Error deleting task', error });
    }
};
