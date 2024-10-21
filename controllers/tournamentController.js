const Tournament = require('../models/Tournament');

// Lấy tất cả các tournament
exports.getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách giải đấu.' });
    }
};

// Tạo mới tournament
exports.createTournament = async (req, res) => {
    const { name, summary, regulations, avatar, location, organizingUnit, tournamentPoints, maxIndividualPoints, expectedStartDate, expectedEndDate, registrationDeadline, minParticipants, maxParticipants, notes, status } = req.body;
    //console.log("createTournament: ", req.body);
    const createdBy = req.user.id;

    try {
        const newTournament = new Tournament({
            name,
            summary,
            regulations,
            avatar,
            location,
            organizingUnit,
            tournamentPoints,
            maxIndividualPoints,
            expectedStartDate,
            expectedEndDate,
            registrationDeadline,
            minParticipants,
            maxParticipants,
            notes,
            status,
            createdBy
        });
        console.log("createTournament: ", newTournament);
        const savedTournament = await newTournament.save();
        res.status(201).json(savedTournament);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo giải đấu.' });
    }
};

// Cập nhật tournament
exports.updateTournament = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedTournament = await Tournament.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json(updatedTournament);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật giải đấu.' });
    }
};

// Xóa tournament
exports.deleteTournament = async (req, res) => {
    const { id } = req.params;

    try {
        await Tournament.findByIdAndDelete(id);
        res.status(200).json({ message: 'Giải đấu đã được xóa.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa giải đấu.' });
    }
};
// API để lấy danh sách giải đấu với phân trang, tìm kiếm và sắp xếp
exports.getPaginatedTournaments = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        // Chuyển đổi page và limit thành số nguyên
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Điều kiện tìm kiếm theo tên giải đấu hoặc tóm tắt (summary)
        const searchCondition = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } }, // Tìm kiếm không phân biệt hoa thường
                      { summary: { $regex: search, $options: 'i' } }
                  ]
              }
            : {};

        // Lấy danh sách giải đấu với điều kiện tìm kiếm và sắp xếp theo ngày bắt đầu gần nhất
        const tournaments = await Tournament.find(searchCondition)
            .sort({ expectedStartDate: -1 }) // Sắp xếp theo expectedStartDate từ gần đến xa
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        // Tính tổng số giải đấu khớp với điều kiện tìm kiếm
        const totalTournaments = await Tournament.countDocuments(searchCondition);

        res.status(200).json({
            tournaments,
            totalPages: Math.ceil(totalTournaments / limitNumber),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
};