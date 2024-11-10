const mongoose = require('mongoose');

const clubUserSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdTime: {
    type: Date,
    default: Date.now // Time when the record was created
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user who created the record
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const ClubUser = mongoose.model('ClubUser', clubUserSchema);

module.exports = ClubUser;
