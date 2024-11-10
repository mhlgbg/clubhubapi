const Playground = require('../models/Playground');

// Get all playgrounds
exports.getAllPlaygrounds = async (req, res) => {
  try {
    const playgrounds = await Playground.find().populate('stadiumManagementId', 'stadiumName'); // Populate stadium name
    res.status(200).json(playgrounds);
  } catch (error) {
    res.status(500).json({ message: 'Server error when fetching playgrounds', error });
  }
};

// Get playground by ID
exports.getPlaygroundById = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id).populate('stadiumManagementId', 'stadiumName');
    if (!playground) {
      return res.status(404).json({ message: 'Playground not found' });
    }
    res.status(200).json(playground);
  } catch (error) {
    res.status(500).json({ message: 'Server error when fetching playground', error });
  }
};

// Lấy danh sách sân chơi theo Ban Quản Lý
exports.getPlaygroundsByStadium = async (req, res) => {
    const { stadiumManagementId } = req.params;
    
    try {
        const playgrounds = await Playground.find({ stadiumManagementId });
        res.status(200).json(playgrounds);
    } catch (error) {
        console.error('Error fetching playgrounds:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sân chơi', error });
    }
};

// Thêm sân chơi mới
exports.createPlayground = async (req, res) => {
    try {
        const newPlayground = new Playground(req.body);
        const savedPlayground = await newPlayground.save();
        res.status(201).json(savedPlayground);
    } catch (error) {
        console.error('Error creating playground:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo sân chơi', error });
    }
};

// Sửa sân chơi
exports.updatePlayground = async (req, res) => {
    const { playgroundId } = req.params;

    try {
        const updatedPlayground = await Playground.findByIdAndUpdate(playgroundId, req.body, { new: true });
        res.status(200).json(updatedPlayground);
    } catch (error) {
        console.error('Error updating playground:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật sân chơi', error });
    }
};

// Xóa sân chơi
exports.deletePlayground = async (req, res) => {
    const { playgroundId } = req.params;

    try {
        await Playground.findByIdAndDelete(playgroundId);
        res.status(200).json({ message: 'Xóa sân chơi thành công' });
    } catch (error) {
        console.error('Error deleting playground:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa sân chơi', error });
    }
};
/*
// Create a new playground
exports.createPlayground = async (req, res) => {
  const { stadiumManagementId, name, description, orientation, status } = req.body;

  try {
    const newPlayground = new Playground({
      stadiumManagementId,
      name,
      description,
      orientation,
      status
    });

    const savedPlayground = await newPlayground.save();
    res.status(201).json(savedPlayground);
  } catch (error) {
    res.status(400).json({ message: 'Error creating playground', error });
  }
};

// Update a playground
exports.updatePlayground = async (req, res) => {
  const { stadiumManagementId, name, description, orientation, status } = req.body;

  try {
    const playground = await Playground.findById(req.params.id);

    if (!playground) {
      return res.status(404).json({ message: 'Playground not found' });
    }

    playground.stadiumManagementId = stadiumManagementId || playground.stadiumManagementId;
    playground.name = name || playground.name;
    playground.description = description || playground.description;
    playground.orientation = orientation || playground.orientation;
    playground.status = status || playground.status;
    playground.updatedAt = Date.now();

    const updatedPlayground = await playground.save();
    res.status(200).json(updatedPlayground);
  } catch (error) {
    res.status(400).json({ message: 'Error updating playground', error });
  }
};

// Delete a playground
exports.deletePlayground = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id);

    if (!playground) {
      return res.status(404).json({ message: 'Playground not found' });
    }

    await playground.remove();
    res.status(200).json({ message: 'Playground deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting playground', error });
  }
};*/
