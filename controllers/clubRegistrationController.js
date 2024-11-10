const ClubRegistration = require('../models/ClubRegistration');
const { sendRegistrationEmail, sendWelcomeEmail, sendWelcomeEmailExistingUser } = require('./utils/emailService');
const Club = require('../models/Club');
const User = require('../models/User');
const ClubUser = require('../models/ClubUser');
const bcrypt = require('bcryptjs');


// Get all club registrations
/*exports.getClubRegistrations = async (req, res) => {
  try {
    const clubRegistrations = await ClubRegistration.find().populate('sportId'); // Populate sport details
    res.json(clubRegistrations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching club registrations' });
  }
};
*/
exports.getClubRegistrations = async (req, res) => {
    try {
        const { status } = req.query; // Get the status filter from query params
        let query = {};
        if (status) {
            query.status = status; // If status is provided, filter by it
        }

        const clubs = await ClubRegistration.find(query).sort({ createdAt: -1 }).populate('sportId');;
        res.json(clubs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Create a new club registration
exports.createClubRegistration = async (req, res) => {
    const { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerTitle, managerEmail, managerPhoneNumber, foundedDate, status } = req.body;

    try {
        // Kiểm tra xem tên câu lạc bộ đã tồn tại chưa
        const existingClub = await ClubRegistration.findOne({ clubName });
        if (existingClub) {
            return res.status(400).json({ error: 'Tên câu lạc bộ đã tồn tại. Vui lòng chọn tên khác.' });
        }

        // Nếu tên không trùng, tiến hành tạo câu lạc bộ mới
        const newClubRegistration = new ClubRegistration({
            sportId,
            clubName,
            avatar,
            location,
            operatingHours,
            currentPresidentName,
            managerName,
            managerTitle,
            managerEmail,
            managerPhoneNumber,
            foundedDate,
            status
        });

        // Lưu câu lạc bộ mới vào cơ sở dữ liệu
        const savedClubRegistration = await newClubRegistration.save();

        // Gửi email xác nhận đăng ký thành công
        await sendRegistrationEmail(managerEmail, clubName, managerName);

        // Trả về thông tin câu lạc bộ đã được lưu
        res.json(savedClubRegistration);
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ error: 'Error creating club registration' });
    }
};


// Update a club registration
exports.updateClubRegistration = async (req, res) => {
    const { status } = req.body; // Chỉ lấy status từ request body

    try {
        // Tìm bản ghi ClubRegistration theo ID
        const existingRegistration = await ClubRegistration.findById(req.params.id);

        if (!existingRegistration) {
            return res.status(404).json({ error: 'Club registration not found' });
        }

        // Cập nhật trạng thái của bản ghi
        existingRegistration.status = status;
        const updatedClubRegistration = await existingRegistration.save();

        console.log("updateClubRegistration: ", updatedClubRegistration);

        // Nếu trạng thái chuyển thành "Được chấp nhận", tạo câu lạc bộ và kiểm tra user
        if (status === 'Được chấp nhận') {
            const { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerEmail, managerPhoneNumber, foundedDate } = existingRegistration;

            // 1. Tạo câu lạc bộ trong bảng Club
            const newClub = new Club({
                sportId,
                name: clubName,
                avatar,
                foundedDate,
                operatingHours,
                location,
                president: currentPresidentName,
                introduction: `Welcome to ${clubName}, managed by ${managerName}.`,
                notes: `Club created from registration of ${managerName}.`
            });

            console.log("updateClubRegistration: ", newClub);
            const savedClub = await newClub.save();

            // 2. Kiểm tra xem đã có user với email hoặc username của manager hay chưa
            let user = await User.findOne({ $or: [{ username: managerEmail }, { email: managerEmail }] });
            console.log("updateClubRegistration: ", user);

            if (!user) {
                // Sinh mật khẩu ngẫu nhiên (Club@ + 3 con số)
                const randomPassword = `Club@${Math.floor(100 + Math.random() * 900)}`;
                const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash mật khẩu trước khi lưu

                // Tạo user mới
                user = new User({
                    username: managerEmail,
                    password: hashedPassword, // Bạn sẽ cần hash mật khẩu này trước khi lưu (ví dụ sử dụng bcrypt)
                    email: managerEmail,
                    phoneNumber: managerPhoneNumber,
                    roles: ['manager']
                });
                const savedUser = await user.save();

                // 3. Tạo bản ghi trong ClubUser
                const clubUser = new ClubUser({
                    clubId: savedClub._id,
                    userId: savedUser._id,
                    createdBy: req.user.id // Assuming you are passing the current user ID in request
                });

                console.log("updateClubRegistration: ", savedUser);
                await clubUser.save();

                // 4. Gửi email chào mừng
                await sendWelcomeEmail(managerEmail, managerName, randomPassword, savedClub.name);
            } else {
                // 3. Tạo bản ghi trong ClubUser nếu user đã tồn tại
                const clubUser = new ClubUser({
                    clubId: savedClub._id,
                    userId: user._id,
                    createdBy: req.user.id
                });
                await clubUser.save();
                await sendWelcomeEmailExistingUser(managerEmail, managerName, savedClub.name);
            }
        }

        res.json(updatedClubRegistration);
    } catch (error) {
        console.log("updateClubRegistration: ", error);
        res.status(500).json({ error: 'Error updating club registration' });
    }
};


// Create a new club registration and handle approval
exports.createAndApproveClubRegistration = async (req, res) => {
  console.log("createAndApproveClubRegistration: ", req.body);
  const { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerTitle, managerEmail, managerPhoneNumber, foundedDate } = req.body;

  try {
      // Kiểm tra xem tên câu lạc bộ đã tồn tại chưa
      const existingClub = await ClubRegistration.findOne({ clubName });
      if (existingClub) {
          return res.status(400).json({ error: 'Tên câu lạc bộ đã tồn tại. Vui lòng chọn tên khác.' });
      }

      // Nếu tên không trùng, tiến hành tạo đăng ký câu lạc bộ mới
      const newClubRegistration = new ClubRegistration({
          sportId,
          clubName,
          avatar,
          location,
          operatingHours,
          currentPresidentName,
          managerName,
          managerTitle,
          managerEmail,
          managerPhoneNumber,
          foundedDate,
          status: 'Được chấp nhận' // Trạng thái ngay lập tức được phê duyệt
      });

      // Lưu đăng ký câu lạc bộ mới vào cơ sở dữ liệu
      const savedClubRegistration = await newClubRegistration.save();

      // Kiểm tra xem đã có user với email hoặc username của manager hay chưa
      let user = await User.findOne({ $or: [{ username: managerEmail }, { email: managerEmail }] });
      console.log("Manager user lookup: ", user);

      if (!user) {
          // Sinh mật khẩu ngẫu nhiên (Club@ + 3 con số)
          const randomPassword = `Club@${Math.floor(100 + Math.random() * 900)}`;
          const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash mật khẩu trước khi lưu

          // Tạo user mới
          user = new User({
              username: managerEmail,
              password: hashedPassword, // Lưu mật khẩu đã hash
              email: managerEmail,
              phoneNumber: managerPhoneNumber,
              fullName: managerName,
              roles: ['manager']
          });
          const savedUser = await user.save();

          // Gửi email chào mừng với mật khẩu
          await sendWelcomeEmail(managerEmail, managerName, randomPassword, clubName);
      }
      else{
        await sendWelcomeEmailExistingUser(managerEmail, managerName, clubName);
      }

      // 1. Tạo câu lạc bộ trong bảng Club
      const newClub = new Club({
          sportId,
          name: clubName,
          avatar,
          foundedDate,
          operatingHours,
          location,
          president: currentPresidentName,
          introduction: `Welcome to ${clubName}, managed by ${managerName}.`,
          notes: `Club created from registration of ${managerName}.`
      });

      const savedClub = await newClub.save();

      // 2. Tạo bản ghi trong ClubUser
      const clubUser = new ClubUser({
          clubId: savedClub._id,
          userId: user._id,
          createdBy: user._id // Người quản lý tự tạo club
      });

      await clubUser.save();

      // Trả về thông tin câu lạc bộ đã được tạo và người quản lý
      res.json({ club: savedClub, clubUser });
  } catch (error) {
      console.error('Error creating and approving club registration:', error);
      res.status(500).json({ error: 'Error creating and approving club registration' });
  }
};

/*
exports.updateClubRegistration = async (req, res) => {
    const { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerTitle, managerEmail, managerPhoneNumber, foundedDate, status } = req.body;
  
    try {
      const updatedClubRegistration = await ClubRegistration.findByIdAndUpdate(
        req.params.id,
        { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerTitle, managerEmail, managerPhoneNumber, foundedDate, status },
        { new: true }
      );

      console.log("updateClubRegistration: ", req.body);
  
      // Nếu trạng thái chuyển thành "Được chấp nhận", tạo câu lạc bộ và kiểm tra user
      if (status === 'Được chấp nhận') {
        // 1. Tạo câu lạc bộ trong bảng Club
        const newClub = new Club({
          sportId,
          name: clubName,
          avatar,
          foundedDate,
          operatingHours,
          location,
          president: currentPresidentName,
          introduction: `Welcome to ${clubName}, managed by ${managerName}.`,
          notes: `Club created from registration of ${managerName}.`
        });
        console.log("updateClubRegistration: ", newClub);
        const savedClub = await newClub.save();
        
        // 2. Kiểm tra xem đã có user với email hoặc username của manager hay chưa
        let user = await User.findOne({ $or: [{ username: managerEmail }, { email: managerEmail }] });
        console.log("updateClubRegistration: ", user);
        if (!user) {
          // Sinh mật khẩu ngẫu nhiên (Club@ + 3 con số)
          const randomPassword = `Club@${Math.floor(100 + Math.random() * 900)}`;
          
          // Tạo user mới
          user = new User({
            username: managerEmail,
            password: randomPassword, // Bạn sẽ cần hash mật khẩu này trước khi lưu (ví dụ sử dụng bcrypt)
            email: managerEmail,
            phoneNumber: managerPhoneNumber,
            role: 'manager'
          });
          const savedUser = await user.save();
  
          // 3. Tạo bản ghi trong ClubUser
          const clubUser = new ClubUser({
            clubId: savedClub._id,
            userId: savedUser._id,
            createdBy: req.user.id // Assuming you are passing the current user ID in request
          });

          console.log("updateClubRegistration: ", savedUser);
          await clubUser.save();
  
          // 4. Gửi email chào mừng
          await sendWelcomeEmail(managerEmail, managerName, randomPassword, savedClub.name);
        } else {
          // 3. Tạo bản ghi trong ClubUser nếu user đã tồn tại
          const clubUser = new ClubUser({
            clubId: savedClub._id,
            userId: user._id,
            createdBy: req.userId
          });
          await clubUser.save();
          await sendWelcomeEmailExistingUser(managerEmail, managerName, savedClub.name);
        }
      }
  
      res.json(updatedClubRegistration);
    } catch (error) {
      console.log("updateClubRegistration: ", error);
      res.status(500).json({ error: 'Error updating club registration' });
    }
  };*/

/*exports.updateClubRegistration = async (req, res) => {
  const { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerTitle, managerEmail, managerPhoneNumber, foundedDate, status } = req.body;
  try {
    const updatedClubRegistration = await ClubRegistration.findByIdAndUpdate(
      req.params.id,
      { sportId, clubName, avatar, location, operatingHours, currentPresidentName, managerName, managerTitle, managerEmail, managerPhoneNumber, foundedDate, status },
      { new: true }
    );
    res.json(updatedClubRegistration);
  } catch (error) {
    res.status(500).json({ error: 'Error updating club registration' });
  }
};
*/
// Delete a club registration
exports.deleteClubRegistration = async (req, res) => {
    try {
        await ClubRegistration.findByIdAndDelete(req.params.id);
        res.json({ message: 'Club registration deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting club registration' });
    }
};
