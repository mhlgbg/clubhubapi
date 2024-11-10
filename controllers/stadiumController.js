const StadiumManagement = require('../models/StadiumManagement');
const Playground = require('../models/Playground');
const TimeSlot = require('../models/TimeSlot');

//Lấy các sân của userId
exports.getUserManagedStadiums = async (req, res) => {
    //console.log("getUserManagedStadiums req.user.id ", req.user.id)
    try {
        const userId = req.user.id; // Giả định bạn có middleware để xác định người dùng
        const stadiums = await StadiumManagement.find({ managers: userId }).populate('sportId', 'name');
        
        if (!stadiums.length) {
            return res.status(404).json({ message: 'Bạn chưa được phân công quản lý sân nào' });
        }

        res.status(200).json(stadiums);
    } catch (error) {
        console.error('Error fetching user-managed stadiums:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sân bạn quản lý', error });
    }
};

// Get all stadiums
exports.getAllStadiums = async (req, res) => {
    try {
        const stadiums = await StadiumManagement.find().populate('managers', 'name email').populate('sportId', 'name'); // Populate manager details
        res.status(200).json(stadiums);
    } catch (error) {
        res.status(500).json({ message: 'Server error when fetching stadiums', error });
    }
};

// Get stadium by ID
// Get stadium by ID
exports.getStadiumById = async (req, res) => {
    //console.log("getStadiumById");
    try {
        // Populate sportId và managers từ User model
        const stadium = await StadiumManagement.findById(req.params.id)
            .populate('sportId', 'name') // Lấy thông tin từ bảng Sport
            .populate('managers', 'fullName email'); // Lấy thông tin từ bảng User

        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.status(200).json(stadium);
    } catch (error) {
        res.status(500).json({ message: 'Server error when fetching stadium', error });
    }
};

// Create a new stadium
exports.createStadium = async (req, res) => {
    //console.log("createStadium: ", req.body);
    const {
        sportId, stadiumName, address, googleMapLink, contactPhone, avatar, imageLinks,
        youtubeLink, representativeName, managers, introduction, pricingTable
    } = req.body;
    //const userId = req.user.id;
    try {
        const newStadium = new StadiumManagement({
            sportId,
            stadiumName,
            address,
            googleMapLink,
            contactPhone,
            avatar,
            imageLinks,
            youtubeLink,
            representativeName,
            managers,
            introduction,
            pricingTable,
            updatedBy: req.user.id // Assuming you have the user from middleware
        });

        const savedStadium = await newStadium.save();
        res.status(201).json(savedStadium);
    } catch (error) {
        res.status(400).json({ message: 'Error creating stadium', error });
    }
};

// Update stadium by ID
exports.updateStadium = async (req, res) => {
    const {
        sportId, stadiumName, address, googleMapLink, contactPhone, avatar, imageLinks,
        youtubeLink, representativeName, managers, introduction, pricingTable
    } = req.body;

    try {
        const updatedStadium = await StadiumManagement.findByIdAndUpdate(
            req.params.id,
            {
                sportId, 
                stadiumName,
                address,
                googleMapLink,
                contactPhone,
                avatar,
                imageLinks,
                youtubeLink,
                representativeName,
                managers,
                introduction,
                pricingTable,
                updatedAt: Date.now(),
                updatedBy: req.user.id // Assuming you have the user from middleware
            },
            { new: true } // Return the updated document
        );

        if (!updatedStadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }

        res.status(200).json(updatedStadium);
    } catch (error) {
        res.status(400).json({ message: 'Error updating stadium', error });
    }
};

// Delete stadium by ID
exports.deleteStadium = async (req, res) => {
    try {
        const deletedStadium = await StadiumManagement.findByIdAndDelete(req.params.id);
        if (!deletedStadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.status(200).json({ message: 'Stadium deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting stadium', error });
    }
};

// Get all managers of a stadium
exports.getStadiumManagers = async (req, res) => {
    try {
        const stadium = await StadiumManagement.findById(req.params.id).populate('managers', 'name email');
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.status(200).json(stadium.managers);
    } catch (error) {
        res.status(500).json({ message: 'Server error when fetching managers', error });
    }
};

// Add manager to a stadium
exports.addManagerToStadium = async (req, res) => {
    try {
        const { managerId } = req.body;
        const stadium = await StadiumManagement.findById(req.params.id);
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        // Check if the manager is already in the list
        if (stadium.managers.includes(managerId)) {
            return res.status(400).json({ message: 'Manager already added' });
        }
        stadium.managers.push(managerId);
        await stadium.save();
        res.status(200).json({ message: 'Manager added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error when adding manager', error });
    }
};

// Remove manager from a stadium
exports.removeManagerFromStadium = async (req, res) => {
    try {
        const { managerId } = req.params;
        const stadium = await StadiumManagement.findById(req.params.id);
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        stadium.managers = stadium.managers.filter((id) => id.toString() !== managerId);
        await stadium.save();
        res.status(200).json({ message: 'Manager removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error when removing manager', error });
    }
};

// API để lấy danh sách sân theo các `stadiumIds`
exports.getStadiumsByIds = async (req, res) => {
    //console.log("getStadiumsByIds: ", req.query.ids);
    try {
        const stadiumIds = req.query.ids; // Lấy danh sách ids từ query

        // Tìm sân có _id nằm trong danh sách ids
        const stadiums = await StadiumManagement.find({ _id: { $in: stadiumIds } });

        res.status(200).json(stadiums);
    } catch (error) {
        console.error('Error fetching stadiums:', error);
        res.status(500).json({ message: 'Error fetching stadiums', error });
    }
};

// API để lấy danh sách sân vận động với phân trang và tìm kiếm
exports.getPaginatedStadiums = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Điều kiện tìm kiếm theo tên hoặc mô tả sân vận động
        const query = search 
            ? { 
                $or: [
                    { stadiumName: new RegExp(search, 'i') },
                    { introduction: new RegExp(search, 'i') }
                ] 
              }
            : {};

        const stadiums = await StadiumManagement.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalStadiums = await StadiumManagement.countDocuments(query);

        res.status(200).json({
            stadiums,
            totalPages: Math.ceil(totalStadiums / limitNumber),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stadiums', error });
    }
};


// Lấy các time slots của sân dựa trên stadiumId và số ngày muốn xem
exports.getTimeSlots = async (req, res) => {
    const { stadiumId } = req.params;
    const { days } = req.query;

    // Ngày hiện tại, đặt thời gian về 0 giờ (để dễ dàng so sánh theo ngày)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Đặt giờ về 0:00:00

    // Tính toán ngày kết thúc dựa trên số ngày người dùng chọn
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + parseInt(days) - 1); // Giảm 1 vì days=1 chỉ lấy ngày hiện tại
    endDate.setHours(23, 59, 59, 0);
    try {
        // Lấy tất cả các sân con (playgrounds) của sân vận động
        const playgrounds = await Playground.find({ stadiumManagementId: stadiumId });

        // Lấy các time slot của playground trong khoảng ngày hiện tại và số ngày người dùng chọn
        const timeSlots = await TimeSlot.find({
            playgroundId: { $in: playgrounds.map(pg => pg._id) },
            date: { $gte: currentDate, $lte: endDate } // Giới hạn thời gian từ ngày hiện tại đến ngày kết thúc
        }).populate('playgroundId', 'name description orientation'); // Chỉ lấy các thuộc tính cần thiết từ Playground

        res.json({ timeSlots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy các slot thời gian.' });
    }
};


// Lấy thông tin BQL Sân
exports.getStadiumInfo = async (req, res) => {
    try {
        const stadium = await StadiumManagement.findById(req.params.stadiumId);
        res.json(stadium);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stadium info' });
    }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
    try {
        const stadium = await StadiumManagement.findById(req.params.stadiumId);
        stadium.avatar = `uploads/avatars/${req.file.filename}`;
        await stadium.save();
        res.json({ message: 'Avatar updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading avatar' });
    }
};

// Thêm ảnh gallery
exports.addGalleryImage = async (req, res) => {
    try {
        const stadium = await StadiumManagement.findById(req.params.stadiumId);
        
        // Kiểm tra xem có file được upload không
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        // Thêm đường dẫn của file vào imageLinks
        stadium.imageLinks.push(`uploads/avatars/${req.file.filename}`);
        await stadium.save();

        res.json({ message: 'Image added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding image' });
    }
};

// Xóa ảnh gallery
exports.deleteGalleryImage = async (req, res) => {
    try {
        const stadium = await StadiumManagement.findById(req.params.stadiumId);
        stadium.imageLinks = stadium.imageLinks.filter(image => image !== req.body.image);
        await stadium.save();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image' });
    }
};