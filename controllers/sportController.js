const Sport = require('../models/Sport');

// Lấy tất cả các môn thể thao
const getSports = async (req, res) => {
    try {
        const sports = await Sport.find();
        res.json(sports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy môn thể thao theo ID
const getSportById = async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) {
            return res.status(404).json({ message: 'Sport not found' });
        }
        res.json(sport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mới môn thể thao
const createSport = async (req, res) => {
    console.log("createSport: ", req.body);
    const { name, description, avatar } = req.body;
    try {
        const sport = new Sport({ name, description, avatar });
        const newSport = await sport.save();
        res.status(201).json(newSport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật môn thể thao
const updateSport = async (req, res) => {
    try {
        const { name, description, avatar } = req.body;
        const sport = await Sport.findByIdAndUpdate(req.params.id, { name, description, avatar }, { new: true });
        if (!sport) {
            return res.status(404).json({ message: 'Sport not found' });
        }
        res.json(sport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa môn thể thao
const deleteSport = async (req, res) => {
    try {
        const sport = await Sport.findByIdAndDelete(req.params.id);
        if (!sport) {
            return res.status(404).json({ message: 'Sport not found' });
        }
        res.json({ message: 'Sport deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSports, getSportById, createSport, updateSport, deleteSport };
