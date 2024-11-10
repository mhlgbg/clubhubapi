const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // Ngày diễn ra trận đấu
  matchType: { type: String, enum: ['singles', 'doubles'], required: true }, // Loại hình: "đơn", "đôi"
  maxSets: { type: Number, required: true }, // Số séc tối đa
  team1: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tham chiếu tới bảng ClubMember
      role: { type: String } // Vai trò (chính, dự bị)
    }
  ],
  team2: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tham chiếu tới bảng ClubMember
      role: { type: String } // Vai trò (chính, dự bị)
    }
  ],
  sets: [
    {
      setNumber: { type: Number }, // Số thứ tự séc
      team1Score: { type: Number }, // Điểm đội 1 trong séc này
      team2Score: { type: Number } // Điểm đội 2 trong séc này
    }
  ],
  finalScore: {
    team1Total: { type: Number }, // Tổng điểm đội 1
    team2Total: { type: Number } // Tổng điểm đội 2
  },
  referees: [
    {
      refereeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referee' }, // Tham chiếu tới bảng Referee
      role: { type: String } // Vai trò của trọng tài (ví dụ: chính, phụ)
    }
  ],
  status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' }, // Trạng thái của trận đấu
  notes: { type: String } // Ghi chú về trận đấu
});

module.exports = mongoose.model('Match', matchSchema);
