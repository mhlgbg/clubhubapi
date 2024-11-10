const Match = require('../models/Match');
const PracticeSession = require('../models/PracticeSession');
const ClubMember = require('../models/ClubMember');


// API để lấy danh sách trận đấu với phân trang
exports.getMatchesByDays = async (req, res) => {
  //console.log("getMatchesByDays: ");
  try {
    const { page = 1, limit = 40 } = req.query; // Mặc định 1 trang có 40 trận đấu
    const skip = (page - 1) * limit; // Tính toán số lượng trận bỏ qua để phân trang

    // Lấy các trận đấu, sắp xếp theo ngày từ gần nhất đến xa nhất
    const matches = await Match.find()
      .populate('team1.userId', 'fullName avatar') // Lấy thông tin đầy đủ của vận động viên đội 1
      .populate('team2.userId', 'fullName avatar') // Lấy thông tin đầy đủ của vận động viên đội 2
      .sort({ date: -1 }) // Sắp xếp theo ngày từ gần nhất đến xa nhất
      .skip(skip) // Bỏ qua số trận đấu theo phân trang
      .limit(parseInt(limit)); // Lấy số lượng trận đấu cho mỗi trang (40)

    // Tổng số lượng trận đấu để tính tổng số trang
    const totalMatches = await Match.countDocuments();
    const totalPages = Math.ceil(totalMatches / limit);

    res.status(200).json({
      matches,
      currentPage: parseInt(page),
      totalPages
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách trận đấu' });
  }
};
//Cập nhật match tập luyện
/*exports.editMatchOfPractice = async (req, res) => {
    try {
      const { team1, team2, team1Score, team2Score } = req.body;
      const matchId = req.params.matchId;
  
      // Kiểm tra các trường cần thiết
      if (!team1[0]) {
        return res.status(400).json({ message: 'Nick1 của Team1 là bắt buộc.' });
      }
      if (!team2[0]) {
        return res.status(400).json({ message: 'Nick1 của Team2 là bắt buộc.' });
      }
  
      // Tìm trận đấu cần chỉnh sửa
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ message: 'Trận đấu không tồn tại.' });
      }
  
      // Lấy ClubId từ buổi tập luyện thông qua trận đấu (hoặc qua các cách khác nếu cần)
      const practiceSession = await PracticeSession.findOne({ matches: matchId });
      if (!practiceSession) {
        return res.status(404).json({ message: 'Buổi tập luyện không tồn tại.' });
      }
  
      const clubId = practiceSession.clubId;
  
      // Lấy ClubMemberId của team1 và team2
      const team1Members = [];
      const team2Members = [];
  
      // Tìm ClubMemberId cho Nick1 và Nick2 của Team 1
      for (let i = 0; i < team1.length; i++) {
        if (team1[i]) {
          const member = await ClubMember.findOne({ nickInClub: team1[i], clubId });
          if (!member) {
            return res.status(400).json({ message: `Nick ${team1[i]} của Team1 không tồn tại trong câu lạc bộ.` });
          }
          team1Members.push({ clubMemberId: member._id, role: i === 0 ? 'main' : 'sub' });
        }
      }
  
      // Tìm ClubMemberId cho Nick1 và Nick2 của Team 2
      for (let i = 0; i < team2.length; i++) {
        if (team2[i]) {
          const member = await ClubMember.findOne({ nickInClub: team2[i], clubId });
          if (!member) {
            return res.status(400).json({ message: `Nick ${team2[i]} của Team2 không tồn tại trong câu lạc bộ.` });
          }
          team2Members.push({ clubMemberId: member._id, role: i === 0 ? 'main' : 'sub' });
        }
      }
  
      // Xác định loại trận đấu (đơn hay đôi)
      const matchType = (team1.length === 1 && team2.length === 1) ? 'singles' : 'doubles';
  
      // Cập nhật thông tin trận đấu
      match.matchType = matchType;
      match.team1 = team1Members;
      match.team2 = team2Members;
      match.finalScore = {
        team1Total: team1Score,
        team2Total: team2Score,
      };
      match.referees = [{ refereeId: req.user.id, role: 'main' }]; // Người chỉnh sửa là trọng tài chính
      match.status = 'completed'; // Cập nhật trạng thái trận đấu nếu cần
  
      // Lưu trận đấu đã chỉnh sửa
      const updatedMatch = await match.save();
  
      res.status(200).json({ message: 'Trận đấu đã được chỉnh sửa thành công.', match: updatedMatch });
    } catch (error) {
      console.error('Lỗi khi chỉnh sửa trận đấu:', error);
      res.status(500).json({ message: 'Lỗi server khi chỉnh sửa trận đấu.' });
    }
  };
  */
  exports.editMatchOfPractice = async (req, res) => {
    try {
      const { team1, team2, team1Score, team2Score } = req.body;
      const matchId = req.params.matchId;
  
      // Kiểm tra các trường cần thiết
      if (!team1[0]) {
        return res.status(400).json({ message: 'Nick1 của Team1 là bắt buộc.' });
      }
      if (!team2[0]) {
        return res.status(400).json({ message: 'Nick1 của Team2 là bắt buộc.' });
      }
  
      // Tìm trận đấu cần chỉnh sửa
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ message: 'Trận đấu không tồn tại.' });
      }
  
      // Lấy ClubId từ buổi tập luyện thông qua trận đấu (hoặc qua các cách khác nếu cần)
      const practiceSession = await PracticeSession.findOne({ matches: matchId });
      if (!practiceSession) {
        return res.status(404).json({ message: 'Buổi tập luyện không tồn tại.' });
      }
  
      const clubId = practiceSession.clubId;
  
      const team1Members = [];
      const team2Members = [];
  
      // Tìm userId cho Nick1 và Nick2 của Team 1
      for (let i = 0; i < team1.length; i++) {
        if (team1[i]) {
          const member = await ClubMember.findOne({ nickInClub: team1[i] });
          if (!member) {
            return res.status(400).json({ message: `Nick ${team1[i]} của Team1 không tồn tại.` });
          }
          team1Members.push({ userId: member.userId, role: 'main'});
        }
      }
  
      // Tìm userId cho Nick1 và Nick2 của Team 2
      for (let i = 0; i < team2.length; i++) {
        if (team2[i]) {
          const member = await ClubMember.findOne({ nickInClub: team2[i] });
          if (!member) {
            return res.status(400).json({ message: `Nick ${team2[i]} của Team2 không tồn tại.` });
          }
          team2Members.push({ userId: member.userId, role: i === 0 ? 'main' : 'sub' });
        }
      }
  
      const matchType = (team1.length === 1 && team2.length === 1) ? 'singles' : 'doubles';
  
      // Cập nhật thông tin trận đấu
      match.matchType = matchType;
      match.team1 = team1Members;
      match.team2 = team2Members;
      match.finalScore = {
        team1Total: team1Score,
        team2Total: team2Score,
      };
      match.referees = [{ refereeId: req.user.id, role: 'main' }];
      match.status = 'completed';
  
      // Lưu trận đấu đã chỉnh sửa
      const updatedMatch = await match.save();
  
      res.status(200).json({ message: 'Trận đấu đã được chỉnh sửa thành công.', match: updatedMatch });
    } catch (error) {
      console.error('Lỗi khi chỉnh sửa trận đấu:', error);
      res.status(500).json({ message: 'Lỗi server khi chỉnh sửa trận đấu.' });
    }
  };
  
//Thêm trận đấu vào buổi tập khi chỉ có 4 nick cầu thủ và kết quả
/*exports.addMatchToPractice = async (req, res) => {
    try {
      const { practiceSessionId, team1, team2, team1Score, team2Score } = req.body;
      console.log("addMatchToPractice", req.body);
      // Kiểm tra các trường cần thiết
      if (!team1[0]) {
        return res.status(400).json({ message: 'Nick1 của Team1 là bắt buộc.' });
      }
      if (!team2[0]) {
        return res.status(400).json({ message: 'Nick1 của Team2 là bắt buộc.' });
      }
  
      // Lấy thông tin buổi tập luyện để lấy ClubId
      const practiceSession = await PracticeSession.findById(practiceSessionId);
      if (!practiceSession) {
        return res.status(404).json({ message: 'Buổi tập luyện không tồn tại.' });
      }
  
      const clubId = practiceSession.clubId;
  
      // Lấy ClubMemberId của team1 và team2
      const team1Members = [];
      const team2Members = [];
  
      // Tìm ClubMemberId cho Nick1 và Nick2 của Team 1
      for (let i = 0; i < team1.length; i++) {
        if (team1[i]) {
          const member = await ClubMember.findOne({ nickInClub: team1[i], clubId });
          if (!member) {
            return res.status(400).json({ message: `Nick ${team1[i]} của Team1 không tồn tại trong câu lạc bộ.` });
          }
          team1Members.push({ clubMemberId: member._id, role: i === 0 ? 'main' : 'sub' });
        }
      }
  
      // Tìm ClubMemberId cho Nick1 và Nick2 của Team 2
      for (let i = 0; i < team2.length; i++) {
        if (team2[i]) {
          const member = await ClubMember.findOne({ nickInClub: team2[i], clubId });
          if (!member) {
            return res.status(400).json({ message: `Nick ${team2[i]} của Team2 không tồn tại trong câu lạc bộ.` });
          }
          team2Members.push({ clubMemberId: member._id, role: i === 0 ? 'main' : 'sub' });
        }
      }
  
      // Xác định loại trận đấu (đơn hay đôi)
      const matchType = (team1.length === 1 && team2.length === 1) ? 'singles' : 'doubles';
  
      // Tạo trận đấu mới
      const newMatch = new Match({
        date: new Date(), // Ngày tạo trận đấu
        matchType,
        maxSets: 1, // Không có séc, mặc định là 1
        team1: team1Members,
        team2: team2Members,
        finalScore: {
          team1Total: team1Score,
          team2Total: team2Score,
        },
        referees: [{ refereeId: req.user.id, role: 'main' }], // Người nhập là trọng tài chính
        status: 'completed', // Trạng thái mặc định là "completed"
      });
  
      // Lưu trận đấu vào database
      const savedMatch = await newMatch.save();
  
      // Cập nhật buổi tập luyện để lưu thông tin trận đấu vào danh sách trận đấu
      practiceSession.matches.push(savedMatch._id);
      await practiceSession.save();
  
      res.status(201).json({ message: 'Trận đấu đã được thêm thành công.', match: savedMatch });
    } catch (error) {
      console.error('Lỗi khi thêm trận đấu:', error);
      res.status(500).json({ message: 'Lỗi server khi thêm trận đấu.' });
    }
  };
 */
// Thêm trận đấu vào buổi tập
exports.addMatchToPractice = async (req, res) => {
  //console.log("addMatchToPractice: ", req.body);
  try {
    const { practiceSessionId, team1, team2, team1Score, team2Score } = req.body;

    // Kiểm tra các trường cần thiết
    if (!team1[0]) {
      return res.status(400).json({ message: 'Nick1 của Team1 là bắt buộc.' });
    }
    if (!team2[0]) {
      return res.status(400).json({ message: 'Nick1 của Team2 là bắt buộc.' });
    }

    const practiceSession = await PracticeSession.findById(practiceSessionId);
    if (!practiceSession) {
      return res.status(404).json({ message: 'Buổi tập luyện không tồn tại.' });
    }

    const team1Members = [];
    const team2Members = [];

    // Tìm userId cho Nick1 và Nick2 của Team 1
    for (let i = 0; i < team1.length; i++) {
      if (team1[i]) {
        const member = await ClubMember.findOne({ nickInClub: team1[i] });
        if (!member) {
          return res.status(400).json({ message: `Nick ${team1[i]} của Team1 không tồn tại.` });
        }
        team1Members.push({ userId: member.userId, role: 'main'});
      }
    }

    // Tìm userId cho Nick1 và Nick2 của Team 2
    for (let i = 0; i < team2.length; i++) {
      if (team2[i]) {
        const member = await ClubMember.findOne({ nickInClub: team2[i] });
        if (!member) {
          return res.status(400).json({ message: `Nick ${team2[i]} của Team2 không tồn tại.` });
        }
        team2Members.push({ userId: member.userId, role: 'main'});
      }
    }

    const matchType = (team1.length === 1 && team2.length === 1) ? 'singles' : 'doubles';

    const newMatch = new Match({
      date: practiceSession.practiceDate,
      matchType,
      maxSets: 1,
      team1: team1Members,
      team2: team2Members,
      finalScore: {
        team1Total: team1Score,
        team2Total: team2Score,
      },
      referees: [{ refereeId: req.user.id, role: 'main' }],
      status: 'completed',
    });

    const savedMatch = await newMatch.save();

    practiceSession.matches.push(savedMatch._id);
    await practiceSession.save();

    res.status(201).json({ message: 'Trận đấu đã được thêm thành công.', match: savedMatch });
  } catch (error) {
    console.error('Lỗi khi thêm trận đấu:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm trận đấu.' });
  }
}; 
// Tạo mới trận đấu
exports.createMatch = async (req, res) => {
  try {
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy tất cả các trận đấu
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find().populate('team1.userId').populate('team2.userId').populate('referees.refereeId');
    res.status(200).json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy trận đấu theo ID
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('team1.userId').populate('team2.userId').populate('referees.refereeId');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật trận đấu theo ID
exports.updateMatchById = async (req, res) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMatch) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json(updatedMatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa trận đấu theo ID
exports.deleteMatchById = async (req, res) => {
  try {
    const deletedMatch = await Match.findByIdAndDelete(req.params.id);
    if (!deletedMatch) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//--------------------

/*exports.getAllMatchesOfPractice = async (req, res) => {
    try {
      // Lấy practiceSessionId từ params
      const { practiceSessionId } = req.params;
  
      // Lấy buổi tập luyện và populate danh sách các trận đấu
      const practiceSession = await PracticeSession.findById(practiceSessionId).populate('matches');
  
      if (!practiceSession) {
        return res.status(404).json({ message: 'Buổi tập luyện không tồn tại' });
      }
  
      // Lấy thông tin chi tiết của từng trận đấu
      const matches = await Match.find({ _id: { $in: practiceSession.matches } })
        .populate('team1.clubMemberId team2.clubMemberId', 'nick fullName');
  
      // Định dạng thông tin của từng trận đấu
      const formattedMatches = matches.map(match => {
        // Định dạng danh sách thành viên cho Team 1
        const team1Members = match.team1.map(player => ({
          nickInClub: player.clubMemberId.nick,
          fullName: player.clubMemberId.fullName
        }));
  
        // Định dạng danh sách thành viên cho Team 2
        const team2Members = match.team2.map(player => ({
          nickInClub: player.clubMemberId.nick,
          fullName: player.clubMemberId.fullName
        }));
  
        return {
          matchId: match._id,
          date: match.date,
          matchType: match.matchType,
          maxSets: match.maxSets,
          team1: team1Members, // Trả về team1 dưới dạng mảng các thành viên
          team2: team2Members, // Trả về team2 dưới dạng mảng các thành viên
          finalScore: {
            team1Total: match.finalScore.team1Total,
            team2Total: match.finalScore.team2Total
          },
          status: match.status,
          notes: match.notes
        };
      });
  
      // Trả về danh sách trận đấu đã định dạng
      res.status(200).json({ matches: formattedMatches });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách các trận đấu:', error);
      res.status(500).json({ message: 'Lỗi server khi lấy danh sách các trận đấu' });
    }
  };*/
 


exports.getAllMatchesOfPractice = async (req, res) => {
  try {
    const { practiceSessionId } = req.params;

    // Lấy buổi tập luyện và populate danh sách các trận đấu
    const practiceSession = await PracticeSession.findById(practiceSessionId).populate('matches');

    if (!practiceSession) {
      return res.status(404).json({ message: 'Buổi tập luyện không tồn tại' });
    }

    const clubId = practiceSession.clubId; // Lấy clubId từ buổi tập luyện

    // Tìm và populate các trận đấu từ danh sách matches của practiceSession
    const matches = await Match.find({ _id: { $in: practiceSession.matches } })
      .populate('team1.userId team2.userId', 'fullName avatar');

    // Khởi tạo danh sách các trận đấu với thông tin được định dạng
    const formattedMatches = await Promise.all(matches.map(async (match) => {
      // Tìm nickInClub cho từng thành viên của team1
      const team1Members = await Promise.all(
        match.team1.map(async (player) => {
          const clubMember = await ClubMember.findOne({ clubId, userId: player.userId });
          return {
            nickInClub: clubMember ? clubMember.nickInClub : null,
            fullName: player.userId.fullName,
            avatar: player.userId.avatar
          };
        })
      );

      // Tìm nickInClub cho từng thành viên của team2
      const team2Members = await Promise.all(
        match.team2.map(async (player) => {
          const clubMember = await ClubMember.findOne({ clubId, userId: player.userId });
          return {
            nickInClub: clubMember ? clubMember.nickInClub : null,
            fullName: player.userId.fullName,
            avatar: player.userId.avatar
          };
        })
      );

      // Trả về thông tin trận đấu đã định dạng
      return {
        matchId: match._id,
        date: match.date,
        matchType: match.matchType,
        maxSets: match.maxSets,
        team1: team1Members,
        team2: team2Members,
        finalScore: {
          team1Total: match.finalScore.team1Total,
          team2Total: match.finalScore.team2Total
        },
        status: match.status,
        notes: match.notes
      };
    }));

    res.status(200).json({ matches: formattedMatches });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách các trận đấu:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách các trận đấu' });
  }
};
