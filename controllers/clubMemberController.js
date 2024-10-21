const ClubMember = require('../models/ClubMember');
const Club = require('../models/Club');
const ClubUser = require('../models/ClubUser');
const User = require('../models/User');
const Sport = require('../models/Sport');

exports.inviteUserToClub = async (req, res) => {
  
  const { email } = req.body;
  const { clubId } = req.params;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    console.log("inviteUserToClub user: ", user);
    if (!user) {
      return res.status(400).json({ success: false, message: "Email chưa đăng ký tài khoản." });
    }

    // Check if the user is already in the club
    const existingMember = await ClubMember.findOne({ clubId, userId: user._id });
    if (existingMember) {
      return res.status(400).json({ success: false, message: "Người dùng đã có trong CLB." });
    }

    // Add the user to the club with status approved
    const newMember = new ClubMember({
      clubId,
      userId: user._id,
      status: 'approved',
      createdBy: req.user.id // Assuming you have the logged-in user information
    });

    await newMember.save();
    res.status(200).json({ success: true, message: "Đã mời thành công người dùng vào CLB." });
  } catch (err) {
    console.log("inviteUserToClub err: ", err);
    res.status(500).json({ success: false, message: 'Lỗi khi mời người dùng tham gia CLB.', error: err.message });
  }
};


exports.approveMember = async (req, res) => {
  try {
    const member = await ClubMember.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: "Thành viên không tồn tại" });

    member.status = 'approved';
    await member.save();
    res.status(200).json({ message: 'Thành viên đã được duyệt' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi duyệt thành viên', error: err });
  }
};

exports.rejectMember = async (req, res) => {
  try {
    const member = await ClubMember.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: "Thành viên không tồn tại" });

    member.status = 'rejected';
    await member.save();
    res.status(200).json({ message: 'Thành viên đã bị từ chối' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi từ chối thành viên', error: err });
  }
};

exports.editNick = async (req, res) => {
  console.log("editNick: ", req.params.memberId);
  try {
    const member = await ClubMember.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: "Thành viên không tồn tại" });

    member.nickInClub = req.body.nick;
    await member.save();
    res.status(200).json({ message: 'Nick thành viên đã được cập nhật' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi sửa thông tin thành viên', error: err });
  }
};

// Get clubs that the logged-in user belongs to
exports.getMyClubs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all clubs where the logged-in user is a member
    const clubs = await ClubMember.find({ userId })
      .populate('clubId', 'name location notes') // Populate club details
      .populate('userId', 'fullName email phoneNumber avatar'); // Populate user details

    res.status(200).json(clubs);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving clubs', error: err.message });
  }
};

// Request to join a new club
exports.joinClub = async (req, res) => {
  const { clubCode } = req.body; // Club code entered by the user
  const userId = req.user.id; // Assuming the user is authenticated
  console.log("joinClub ", req.user);
  try {
    // Find the club by its code
    const club = await Club.findOne({ joinCode: clubCode });
    console.log("joinClub ", club);
    if (!club) {
      return res.status(400).json({ message: 'Mã gia nhập không hợp lệ, vui lòng liên hệ người quản lí CLB để có được mã.' });
    }

    // Check if the user has already requested or is a member of this club
    const existingMember = await ClubMember.findOne({ clubId: club._id, userId });

    if (existingMember) {
      let statusMessage;
      switch (existingMember.status) {
        case 'draft':
          statusMessage = 'Bạn đã xin gia nhập CLB này, vui lòng chờ duyệt.';
          break;
        case 'approved':
          statusMessage = `Bạn đã là thành viên của CLB ${club.name}.`;
          break;
        case 'rejected':
          statusMessage = 'Yêu cầu gia nhập của bạn đã bị từ chối.';
          break;
        case 'suspended':
          statusMessage = 'Tài khoản của bạn trong CLB này đã bị tạm ngưng.';
          break;
        default:
          statusMessage = 'Đã xảy ra lỗi, vui lòng thử lại sau.';
      }
      return res.status(200).json({ message: statusMessage });
    }

    // If not a member, create a new ClubMember record with draft status
    const newMember = new ClubMember({
      clubId: club._id,
      userId,
      status: 'draft', // Pending approval
      createdBy: userId,
    });
    await newMember.save();

    res.status(200).json({ message: `Bạn đã xin gia nhập CLB ${club.name}, vui lòng đợi duyệt.` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi yêu cầu gia nhập câu lạc bộ', error: err.message });
  }
};
// Lấy danh sách thành viên của một câu lạc bộ
exports.getClubMembers = async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const clubMembers = await ClubMember.find({ clubId }).populate('createdBy updatedBy').populate('userId', 'fullName phoneNumber email avatar');;
    res.json(clubMembers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching club members' });
  }
};

// Tạo mới thành viên cho một câu lạc bộ
exports.createClubMember = async (req, res) => {
  const { clubId, nick, fullName, dateOfBirth, email, phone, status, joinDate } = req.body;
  const createdBy = req.user.id; // Lấy userId từ user đã đăng nhập (có thể được truyền từ middleware auth)

  try {
    const newClubMember = new ClubMember({
      clubId,
      nick,
      fullName,
      dateOfBirth,
      email,
      phone,
      status,
      joinDate,
      createdBy
    });

    const savedClubMember = await newClubMember.save();
    res.status(201).json(savedClubMember);
  } catch (error) {
    res.status(500).json({ error: 'Error creating club member' });
  }
};

// Cập nhật thông tin thành viên
exports.updateClubMember = async (req, res) => {
  const { nick, fullName, dateOfBirth, email, phone, status, joinDate } = req.body;
  const updatedBy = req.user.id; // Lấy userId từ user đã đăng nhập (có thể được truyền từ middleware auth)

  try {
    const updatedClubMember = await ClubMember.findByIdAndUpdate(
      req.params.id,
      {
        nick,
        fullName,
        dateOfBirth,
        email,
        phone,
        status,
        joinDate,
        updatedBy,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!updatedClubMember) {
      return res.status(404).json({ error: 'Club member not found' });
    }
    res.json(updatedClubMember);
  } catch (error) {
    res.status(500).json({ error: 'Error updating club member' });
  }
};

// Xóa thành viên
exports.deleteClubMember = async (req, res) => {
  try {
    const deletedClubMember = await ClubMember.findByIdAndDelete(req.params.id);
    if (!deletedClubMember) {
      return res.status(404).json({ error: 'Club member not found' });
    }
    res.json({ message: 'Club member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting club member' });
  }
};
