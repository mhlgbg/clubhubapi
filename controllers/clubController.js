const Club = require('../models/Club');
const ClubUser = require('../models/ClubUser');
const User = require('../models/User');
const Sport = require('../models/Sport');

const ClubMember = require('../models/ClubMember');



exports.getClubsOfUser = async (req, res) => {
  console.log("getClubsOfUser");
  try {
    // req.user được lấy từ middleware verifyToken, chứa thông tin của user đăng nhập
    const userId = req.user.id;  // Đảm bảo req.user.id đúng

    // Tìm tất cả các câu lạc bộ mà user này là thành viên, populate 'clubId' để lấy thông tin chi tiết câu lạc bộ
    const clubs = await ClubUser.find({ userId }).populate('clubId');
    
    
    if (!clubs || clubs.length === 0) {
      return res.status(404).json({ message: 'No clubs found for this user' });
    }

    // Trả về danh sách các câu lạc bộ (sau khi populate)
    res.status(200).json({ clubs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get all clubs
exports.getClubs = async (req, res) => {
  try {
    const clubs = await Club.find().populate('sportId'); // Populate sport details
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clubs' });
  }
};

// Create a new club
exports.createClub = async (req, res) => {
  const { sportId, name, avatar, foundedDate, operatingHours, location, president, introduction, notes } = req.body;
  try {
    const newClub = new Club({
      sportId,
      name,
      avatar,
      foundedDate,
      operatingHours,
      location,
      president,
      introduction,
      notes
    });
    const savedClub = await newClub.save();
    res.json(savedClub);
  } catch (error) {
    res.status(500).json({ error: 'Error creating club' });
  }
};

// Update a club
/*exports.updateClub = async (req, res) => {
  const { sportId, name, avatar, foundedDate, operatingHours, location, president, introduction, notes } = req.body;
  try {
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      { sportId, name, avatar, foundedDate, operatingHours, location, president, introduction, notes },
      { new: true }
    );
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ error: 'Error updating club' });
  }
};*/
// Update a club
exports.updateClub = async (req, res) => {
  const {
    sportId,
    name,
    joinCode,
    uniqueUrl,
    foundedDate,
    operatingHours,
    location,
    president,
    introduction,
    notes
  } = req.body;

  // Lấy đường dẫn ảnh từ req.file nếu có tải lên ảnh mới
  const avatar = req.file ? `uploads/avatars/${req.file.filename}` : req.body.avatar;

  try {
    // Kiểm tra joinCode và uniqueUrl như trước
    if (joinCode) {
      const existingClubWithJoinCode = await Club.findOne({
        joinCode,
        _id: { $ne: req.params.id }
      });
      if (existingClubWithJoinCode) {
        return res.status(400).json({ message: 'JoinCode đã tồn tại.' });
      }
    }

    if (uniqueUrl) {
      const existingClubWithUrl = await Club.findOne({
        uniqueUrl,
        _id: { $ne: req.params.id }
      });
      if (existingClubWithUrl) {
        return res.status(400).json({ message: 'URL duy nhất đã tồn tại.' });
      }
    }

    // Cập nhật thông tin CLB
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      {
        sportId,
        name,
        joinCode,
        uniqueUrl,
        avatar,
        foundedDate,
        operatingHours,
        location,
        president,
        introduction,
        notes
      },
      { new: true }
    );

    if (!updatedClub) {
      return res.status(404).json({ message: 'Không tìm thấy CLB.' });
    }

    res.json(updatedClub);
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật CLB.' });
  }
};

// Delete a club
exports.deleteClub = async (req, res) => {
  try {
    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: 'Club deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting club' });
  }
};


exports.getClubsForMobile = async (req, res) => {
    try {        
        const { page = 1, limit = 10 } = req.query; // Lấy số trang và giới hạn từ query params

        // Tìm tất cả các huấn luyện viên với giới hạn và phân trang
        const clubs = await Club.find()
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Đếm tổng số huấn luyện viên
        const totalClubs = await Club.countDocuments();

        res.json({
            totalPages: Math.ceil(totalClubs / limit),
            currentPage: parseInt(page),
            clubs,
        });
    } catch (error) {
        console.log("getRefereesForMobile: ", error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách huấn trọng tài' });
    }
};

// Controller để lấy danh sách CLB theo danh sách ID
exports.getClubsByIds = async (req, res) => {

  
  try {
      const { ids } = req.query;
      //console.log("getVideosByLinks", ids);
      const clubIds = Array.isArray(ids) ? ids : ids.split(',');

      // Tìm kiếm CLB với ID có trong danh sách
      const clubs = await Club.find({ _id: { $in: clubIds } });
      //console.log("getVideosByLinks", clubs);
      res.status(200).json(clubs);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching clubs', error });
  }
};

// Controller: Lấy danh sách câu lạc bộ với phân trang và điều kiện tìm kiếm
exports.getClubsPaginated = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || ''; // Điều kiện tìm kiếm

      const skip = (page - 1) * limit;

      // Tạo điều kiện tìm kiếm theo tên hoặc mô tả
      const searchCondition = search
          ? { 
              $or: [
                  { name: { $regex: search, $options: 'i' } }, // Tìm theo tên
                  { introduction: { $regex: search, $options: 'i' } } // Tìm theo mô tả
              ]
          }
          : {};

      // Lấy danh sách câu lạc bộ theo điều kiện tìm kiếm và phân trang
      const clubs = await Club.find(searchCondition)
          .skip(skip)
          .limit(limit);

      // Tổng số câu lạc bộ
      const totalClubs = await Club.countDocuments(searchCondition);

      res.status(200).json({
          clubs,
          currentPage: page,
          totalPages: Math.ceil(totalClubs / limit),
      });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching clubs', error });
  }
};

// Lấy thông tin chi tiết của CLB theo ID
exports.getClubDetails = async (req, res) => {
  try {
    // Tìm câu lạc bộ theo ID
    const club = await Club.findById(req.params.id).populate('sportId'); // Populate để lấy tên môn thể thao

    if (!club) {
      return res.status(404).json({ message: 'Câu lạc bộ không tồn tại.' });
    }

    res.json(club);
  } catch (error) {
    console.error('Error fetching club details:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin câu lạc bộ.' });
  }
};


exports.getMembersByClubId = async (req, res) => {
  try {
      const { clubId } = req.params;

      // Kiểm tra xem câu lạc bộ có tồn tại không
      const club = await Club.findById(clubId);
      if (!club) {
          return res.status(404).json({ message: 'Câu lạc bộ không tồn tại' });
      }

      // Tìm tất cả các thành viên thuộc câu lạc bộ
      const members = await ClubMember.find({ clubId })
          .populate('userId', 'fullName email phoneNumber avatar') // Populate thông tin từ User
          .populate('clubId', 'president name location notes') // Populate thông tin từ Club
          .exec();

      res.status(200).json({ members });
  } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách thành viên' });
  }
};

exports.getClubManagers = async (req, res) => {
  const { clubId } = req.params;

  try {
    const managers = await ClubUser.find({ clubId })
      .populate('userId', 'fullName email avatar phoneNumber');

    res.status(200).json(managers);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người quản lý', error: err.message });
  }
};

exports.inviteManager = async (req, res) => {
  
  const { email } = req.body;
  const { clubId } = req.params;

  try {
    const user = await User.findOne({ email });
    //console.log("inviteManager: ", clubId);
    if (!user) {
      return res.status(400).json({ message: 'Email này chưa đăng ký tài khoản.' });
    }

    const existingManager = await ClubUser.findOne({ clubId, userId: user._id });
    if (existingManager) {
      return res.status(400).json({ message: 'Người dùng này đã là quản lý CLB.' });
    }

    const newManager = new ClubUser({
      clubId,
      userId: user._id,
      createdBy: req.user.id,  // Assuming req.user holds the logged-in admin user
    });

    await newManager.save();
    res.status(200).json({ message: 'Đã mời người dùng vào làm quản lý CLB.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi mời quản lý mới.', error: err.message });
  }
};
