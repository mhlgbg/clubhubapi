const registrationTournamentSchema = new mongoose.Schema({
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament', // Tham chiếu tới giải đấu
      required: true
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu tới user (vận động viên)
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    notes: {
        type: String
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  });
  
  const RegistrationTournament = mongoose.model('RegistrationTournament', registrationTournamentSchema);
  module.exports = RegistrationTournament;
  