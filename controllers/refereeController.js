const Referee = require('../models/referee');

// Get all referees
exports.getReferees = async (req, res) => {
    try {
        const referees = await Referee.find().populate('sportId'); // Populate sport details
        res.json(referees);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching referees' });
    }
};

// Create a new referee
exports.createReferee = async (req, res) => {
    const { sportId, nick, fullName, avatar, phoneNumber, zaloLink, facebookLink, email, description } = req.body;
    try {
        const newReferee = new Referee({
            sportId,
            nick,
            fullName,
            avatar,
            phoneNumber,
            zaloLink,
            facebookLink,
            email,
            description
        });
        const savedReferee = await newReferee.save();
        res.json(savedReferee);
    } catch (error) {
        res.status(500).json({ error: 'Error creating referee' });
    }
};

// Update a referee
exports.updateReferee = async (req, res) => {
    const { sportId, nick, fullName, avatar, phoneNumber, zaloLink, facebookLink, email, description } = req.body;
    try {
        const updatedReferee = await Referee.findByIdAndUpdate(
            req.params.id,
            { sportId, nick, fullName, avatar, phoneNumber, zaloLink, facebookLink, email, description },
            { new: true }
        );
        res.json(updatedReferee);
    } catch (error) {
        res.status(500).json({ error: 'Error updating referee' });
    }
};

// Delete a referee
exports.deleteReferee = async (req, res) => {
    try {
        await Referee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Referee deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting referee' });
    }
};

exports.getRefereesForMobile = async (req, res) => {
    try {        
        const { page = 1, limit = 10 } = req.query; // Lấy số trang và giới hạn từ query params

        // Tìm tất cả các huấn luyện viên với giới hạn và phân trang
        const referees = await Referee.find()
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Đếm tổng số huấn luyện viên
        const totalReferees = await Referee.countDocuments();

        res.json({
            totalPages: Math.ceil(totalReferees / limit),
            currentPage: parseInt(page),
            referees,
        });
    } catch (error) {
        console.log("getRefereesForMobile: ", error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách huấn trọng tài' });
    }
};

// API để lấy danh sách trọng tài theo các `refereeIds`
exports.getRefereesByIds = async (req, res) => {
    try {
        const refereeIds = req.query.ids; // Lấy danh sách ids từ query

        // Tìm trọng tài có _id nằm trong danh sách ids
        const referees = await Referee.find({ _id: { $in: refereeIds } });

        res.status(200).json(referees);
    } catch (error) {
        console.error('Error fetching referees:', error);
        res.status(500).json({ message: 'Error fetching referees', error });
    }
};

// API để lấy danh sách trọng tài với phân trang và tìm kiếm
exports.getPaginatedReferees = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        // Chuyển đổi page và limit thành số nguyên
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Tạo điều kiện tìm kiếm
        const searchQuery = {
            $or: [
                { fullName: { $regex: search, $options: 'i' } }, // Tìm kiếm theo tên
                { description: { $regex: search, $options: 'i' } } // Tìm kiếm theo mô tả
            ]
        };

        // Lấy dữ liệu trọng tài phân trang và tìm kiếm
        const referees = await Referee.find(searchQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        // Tính tổng số trọng tài
        const totalReferees = await Referee.countDocuments(searchQuery);

        res.status(200).json({
            referees,
            totalPages: Math.ceil(totalReferees / limitNumber),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching referees', error });
    }
};