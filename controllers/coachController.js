const Coach = require('../models/Coach');

// API để lấy danh sách huấn luyện viên theo các `coachIds`
const getCoachesByIds = async (req, res) => {
    try {
        const coachIds = req.query.ids; // Lấy danh sách ids từ query

        // Tìm các huấn luyện viên có _id nằm trong danh sách ids
        const coaches = await Coach.find({ _id: { $in: coachIds } });

        res.status(200).json(coaches);
    } catch (error) {
        console.error('Error fetching coaches:', error);
        res.status(500).json({ message: 'Error fetching coaches', error });
    }
};
// Lấy tất cả huấn luyện viên
const getCoaches = async (req, res) => {
    try {
        const coaches = await Coach.find().populate('sportId');  // Populate sportId để lấy thông tin môn thể thao
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mới huấn luyện viên
const createCoach = async (req, res) => {
    const { nick, fullName, sportId, phoneNumber, zaloLink, facebookLink, introduction, workingUnit, teachingArea, avatar } = req.body;

    const coach = new Coach({
        nick,
        fullName,
        sportId,
        phoneNumber,
        zaloLink,
        facebookLink,
        introduction,
        workingUnit,
        teachingArea,
        avatar
    });

    try {
        const newCoach = await coach.save();
        res.status(201).json(newCoach);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy huấn luyện viên theo ID
const getCoachById = async (req, res) => {
    try {
        const coach = await Coach.findById(req.params.id).populate('sportId');
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.json(coach);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật huấn luyện viên theo ID
const updateCoach = async (req, res) => {
    const { nick, fullName, sportId, phoneNumber, zaloLink, facebookLink, introduction, workingUnit, teachingArea, avatar } = req.body;

    try {
        const coach = await Coach.findById(req.params.id);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Cập nhật các thông tin huấn luyện viên
        coach.nick = nick || coach.nick;
        coach.fullName = fullName || coach.fullName;
        coach.sportId = sportId || coach.sportId;
        coach.phoneNumber = phoneNumber || coach.phoneNumber;
        coach.zaloLink = zaloLink || coach.zaloLink;
        coach.facebookLink = facebookLink || coach.facebookLink;
        coach.introduction = introduction || coach.introduction;
        coach.workingUnit = workingUnit || coach.workingUnit;
        coach.teachingArea = teachingArea || coach.teachingArea;
        coach.avatar = avatar || coach.avatar;
        coach.lastUpdated = Date.now();

        const updatedCoach = await coach.save();
        res.json(updatedCoach);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa huấn luyện viên theo ID
const deleteCoach = async (req, res) => {
    try {
        const coach = await Coach.findById(req.params.id);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        await coach.remove();
        res.json({ message: 'Coach deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCoachesForMobile = async (req, res) => {
    try {
        console.log("getCoachesForMobile");
        const { page = 1, limit = 10 } = req.query; // Lấy số trang và giới hạn từ query params

        // Tìm tất cả các huấn luyện viên với giới hạn và phân trang
        const coaches = await Coach.find()
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Đếm tổng số huấn luyện viên
        const totalCoaches = await Coach.countDocuments();

        res.json({
            totalPages: Math.ceil(totalCoaches / limit),
            currentPage: parseInt(page),
            coaches,
        });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách huấn luyện viên' });
    }
};


// Controller để lấy danh sách huấn luyện viên với phân trang và tìm kiếm
const getPaginatedCoaches = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        // Chuyển đổi page và limit thành số nguyên
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Điều kiện tìm kiếm: Tìm theo tên hoặc giới thiệu của huấn luyện viên
        const searchCondition = {
            $or: [
                { fullName: { $regex: search, $options: 'i' } },
                { introduction: { $regex: search, $options: 'i' } }
            ]
        };

        // Lấy dữ liệu huấn luyện viên với điều kiện tìm kiếm và phân trang
        const coaches = await Coach.find(searchCondition)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        // Đếm tổng số huấn luyện viên khớp với điều kiện tìm kiếm
        const totalCoaches = await Coach.countDocuments(searchCondition);

        // Trả về danh sách huấn luyện viên và tổng số trang
        res.status(200).json({
            coaches,
            totalPages: Math.ceil(totalCoaches / limitNumber)
        });
    } catch (error) {
        console.error('Error fetching coaches:', error);
        res.status(500).json({ message: 'Error fetching coaches', error });
    }
};

module.exports = {
    getCoachesByIds,
    getCoachesForMobile,
    getCoaches,
    createCoach,
    getCoachById,
    updateCoach,
    deleteCoach,    
    getPaginatedCoaches,
};
